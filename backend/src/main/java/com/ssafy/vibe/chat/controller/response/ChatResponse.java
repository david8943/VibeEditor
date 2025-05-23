package com.ssafy.vibe.chat.controller.response;

import lombok.Builder;

@Builder
public record ChatResponse(
	String aiResponse
) {
	public static ChatResponse from(String response) {
		return ChatResponse.builder()
			.aiResponse(response)
			.build();
	}
}
