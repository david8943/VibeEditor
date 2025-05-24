package com.ssafy.vibe.chat.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.ssafy.vibe.chat.service.dto.ChatMemory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class QdrantVectorService {

	@Value("${spring.data.qdrant.base-url}")
	private String baseUrl;

	@Value("${spring.data.qdrant.api-key}")
	private String apiKey;

	@Value("${spring.data.qdrant.collection-name}")
	private String collectionName;

	public void save(Long userId, String userInput, String aiResponse, float[] vector) {

		String id = UUID.randomUUID().toString();

		Map<String, Object> payload = Map.of(
			"userId", userId,
			"userInput", userInput,
			"aiResponse", aiResponse
		);

		List<Float> vectorList = new ArrayList<>();
		for (float v : vector) {
			vectorList.add(v);
		}

		Map<String, Object> point = Map.of(
			"id", id,
			"vector", vectorList,
			"payload", payload
		);

		Map<String, Object> body = Map.of("points", List.of(point));

		WebClient webClient = WebClient.builder()
			.baseUrl(baseUrl)
			.defaultHeader("Content-Type", "application/json")
			.defaultHeader("api-key", apiKey)
			.build();

		webClient.put()
			.uri("/collections/" + collectionName + "/points")
			.bodyValue(body)
			.retrieve()
			.bodyToMono(Void.class)
			.block();
	}

	public List<ChatMemory> search(Long userId, float[] vector, int topK) {
		Map<String, Object> filter = Map.of(
			"must", List.of(
				Map.of(
					"key", "userId",
					"match", Map.of("value", userId)
				)
			)
		);

		List<Float> vectorList = new ArrayList<>();
		for (float v : vector)
			vectorList.add(v);

		Map<String, Object> body = Map.of(
			"vector", vectorList,
			"top", topK,
			"filter", filter,
			"with_payload", true
		);

		WebClient webClient = WebClient.builder()
			.baseUrl(baseUrl)
			.defaultHeader("api-key", apiKey)
			.build();

		String response = webClient.post()
			.uri("/collections/" + collectionName + "/points/search")
			.bodyValue(body)
			.retrieve()
			.bodyToMono(String.class)
			.block();

		return getChatMemories(response);
	}

	private List<ChatMemory> getChatMemories(String response) {
		JSONObject json = new JSONObject(response);
		JSONArray resultArr = json.getJSONArray("result");
		List<ChatMemory> memories = new ArrayList<>();
		for (int i = 0; i < resultArr.length(); i++) {
			JSONObject resultObj = resultArr.getJSONObject(i);
			JSONObject payload = resultObj.getJSONObject("payload");
			String userInput = payload.getString("userInput");
			String aiResponse = payload.getString("aiResponse");
			double score = resultObj.optDouble("score", 0.0);

			memories.add(new ChatMemory(userInput, aiResponse, score));
		}

		log.info("chatMemory: {}", memories);
		return memories;
	}
}
