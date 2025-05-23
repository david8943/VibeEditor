package com.ssafy.vibe.chat.controller.request;

public record ChatRequest(
	Long userAIProviderId,
	String message
) {
}
