package com.ssafy.vibe.chat.service;

import com.ssafy.vibe.chat.controller.request.ChatRequest;
import com.ssafy.vibe.chat.controller.response.ChatResponse;

public interface ChatService {
	ChatResponse chat(Long userId, ChatRequest request);
}
