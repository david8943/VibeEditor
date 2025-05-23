package com.ssafy.vibe.chat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.vibe.auth.domain.UserPrincipal;
import com.ssafy.vibe.chat.controller.request.ChatRequest;
import com.ssafy.vibe.chat.controller.response.ChatResponse;
import com.ssafy.vibe.chat.service.ChatService;
import com.ssafy.vibe.common.schema.BaseResponse;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatController {

	private final ChatService chatService;

	@Operation(
		summary = "AI 채팅",
		description = """
			이전 대화 기록을 바탕으로 AI와 채팅을 합니다.
			"""
	)
	@PostMapping("/ai")
	public ResponseEntity<BaseResponse<ChatResponse>> generateChat(
		@AuthenticationPrincipal UserPrincipal userPrincipal,
		@Valid @RequestBody ChatRequest aiChatRequest
	) {
		ChatResponse response = chatService.chat(userPrincipal.getUserId(), aiChatRequest);
		return ResponseEntity.ok(BaseResponse.success(response));
	}
}
