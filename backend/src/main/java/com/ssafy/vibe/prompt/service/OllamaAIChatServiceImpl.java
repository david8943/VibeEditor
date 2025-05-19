package com.ssafy.vibe.prompt.service;

import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.stereotype.Service;

import com.ssafy.vibe.prompt.service.dto.AiChatInputDTO;
import com.ssafy.vibe.prompt.util.OllamaUtil;
import com.ssafy.vibe.user.domain.AiBrandName;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class OllamaAIChatServiceImpl implements AiChatService {
	private final OllamaUtil ollamaUtil;

	@Override
	public AiBrandName getBrand() {
		return AiBrandName.Ollama;
	}

	@Override
	public String[] generateChat(AiChatInputDTO input) {
		ChatResponse response = ollamaUtil.callOllama(
			input.model(),
			input.temperature(),
			input.systemPrompt(),
			input.userPrompt()
		);

		return ollamaUtil.handleOllamaResponse(response);
	}

	@Override
	public void validateApiKey(String apiKey) {

	}
}
