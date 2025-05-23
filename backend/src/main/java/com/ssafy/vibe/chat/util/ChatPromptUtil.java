package com.ssafy.vibe.chat.util;

import java.util.List;

import org.springframework.stereotype.Component;

import com.ssafy.vibe.chat.service.dto.ChatMemory;

@Component
public class ChatPromptUtil {

	public String buildWithMemory(List<ChatMemory> memories, String message) {
		StringBuilder sb = new StringBuilder();

		for (ChatMemory memory : memories) {
			sb.append("Q: ").append(memory.userInput()).append("\n");
			sb.append("A: ").append(memory.aiResponse()).append("\n\n");
		}

		sb.append("Q: ").append(message).append("\nA: ");
		return sb.toString();
	}
}
