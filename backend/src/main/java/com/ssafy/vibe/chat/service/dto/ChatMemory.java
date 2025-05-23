package com.ssafy.vibe.chat.service.dto;

public record ChatMemory(
	String userInput,
	String aiResponse,
	double score
) {
	@Override
	public String toString() {
		return "userInput = " + userInput + ", aiResponse = " + aiResponse + ", score = " + score;
	}
}