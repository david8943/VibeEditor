package com.ssafy.vibe.prompt.util;

import static com.ssafy.vibe.common.exception.ExceptionCode.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.vibe.common.exception.BadRequestException;
import com.ssafy.vibe.common.exception.ExternalAPIException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class OllamaUtil {

	private static final ObjectMapper mapper = new ObjectMapper();

	public ChatResponse callOllama(
		String model, Double temperature,
		String systemPromptContent, String userPromptContent
	) {
		OllamaApi ollamaApi = new OllamaApi();

		OllamaOptions options = OllamaOptions.builder()
			.model(model)
			.temperature(temperature)
			.build();

		Prompt prompt = new Prompt(
			List.of(
				new SystemMessage(systemPromptContent),
				new UserMessage(userPromptContent)),
			options);

		OllamaChatModel chatModel = OllamaChatModel.builder()
			.ollamaApi(ollamaApi)
			.defaultOptions(options)
			.build();

		try {
			return chatModel.call(prompt);
		} catch (RuntimeException e) {
			String errorMsg = e.getMessage();
			log.error("Ollama 호출 실패: {}", errorMsg);
			if (errorMsg.contains("404")) {
				throw new BadRequestException(OLLAMA_MODEL_NOT_FOUND);
			} else {
				throw new BadRequestException(OLLAMA_BAD_REQUEST_ERROR);
			}
		}
	}

	public String[] handleOllamaResponse(ChatResponse response) {
		String content = response.getResult().getOutput().getText();

		return parseContent(content);
	}

	private String[] parseContent(String content) {
		log.info("Ollama content: {}", content);
		if (content == null) {
			throw new ExternalAPIException(OLLAMA_REQUEST_DATA_NOT_FOUND);
		}

		String[] lines = content.split("\n", -1);
		if (lines.length > 0 && lines[0].trim().matches("^```\\w+\\s*$")) {
			lines = Arrays.copyOfRange(lines, 1, lines.length); // 첫 줄 제거
		}

		// 첫 줄 postTitle
		String rawTitle = lines[0].trim();
		if (!rawTitle.startsWith("#")) {
			throw new ExternalAPIException(OLLAMA_REQUEST_DATA_NOT_FOUND);
		}
		String postTitle = rawTitle.replaceFirst("^#+\\s*", "");
		log.info("Ollama postTitle: {}", postTitle);

		// 나머지 줄 postContent
		String postContent = Arrays.stream(lines)
			.skip(1)
			.collect(Collectors.joining("\n"));
		log.info("Ollama postContent: {}", postContent);

		if (postTitle.isBlank() || postContent.isBlank()) {
			throw new ExternalAPIException(OLLAMA_REQUEST_DATA_NOT_FOUND);
		}

		return new String[] {postTitle, postContent};
	}
}
