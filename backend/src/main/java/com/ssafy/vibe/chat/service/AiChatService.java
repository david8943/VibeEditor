package com.ssafy.vibe.chat.service;

import com.ssafy.vibe.prompt.service.dto.AiChatInputDTO;
import com.ssafy.vibe.user.domain.AiBrandName;

public interface AiChatService {
	AiBrandName getBrand();

	String generateChat(AiChatInputDTO input);

	String[] generateBlogPost(AiChatInputDTO input);

	void validateApiKey(String apiKey);
}
