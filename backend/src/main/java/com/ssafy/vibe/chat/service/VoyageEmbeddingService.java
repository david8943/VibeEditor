package com.ssafy.vibe.chat.service;

import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VoyageEmbeddingService {

	@Value("${spring.embedding.voyage.base-url}")
	private String baseUrl;

	@Value("${spring.embedding.voyage.api-key}")
	private String apiKey;

	public float[] getEmbedding(String input) {
		Map<String, Object> body = Map.of(
			"input", input,
			"model", "voyage-code-3"
		);

		WebClient webClient = WebClient.builder()
			.baseUrl(baseUrl)
			.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
			.build();

		String response = webClient.post()
			.uri("/embeddings")
			.bodyValue(body)
			.retrieve()
			.bodyToMono(String.class)
			.block();

		JSONObject json = new JSONObject(response);
		JSONArray embArr = json.getJSONArray("data")
			.getJSONObject(0)
			.getJSONArray("embedding");

		float[] embedding = new float[embArr.length()];
		for (int i = 0; i < embArr.length(); i++) {
			embedding[i] = (float)embArr.getDouble(i);
		}

		return embedding;
	}
}
