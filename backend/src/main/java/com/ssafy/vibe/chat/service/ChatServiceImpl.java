package com.ssafy.vibe.chat.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ssafy.vibe.chat.controller.request.ChatRequest;
import com.ssafy.vibe.chat.controller.response.ChatResponse;
import com.ssafy.vibe.chat.service.dto.ChatMemory;
import com.ssafy.vibe.chat.template.ChatPromptTemplate;
import com.ssafy.vibe.chat.util.ChatPromptUtil;
import com.ssafy.vibe.common.util.Aes256Util;
import com.ssafy.vibe.prompt.service.dto.AiChatInputDTO;
import com.ssafy.vibe.user.domain.AiProviderEntity;
import com.ssafy.vibe.user.domain.UserAiProviderEntity;
import com.ssafy.vibe.user.repository.UserAiProviderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

	private final int TOP_K = 5;

	private final AiChatServiceFactory aiChatServiceFactory;
	private final UserAiProviderRepository userAiProviderRepository;
	private final QdrantVectorService qdrantVectorService;
	private final VoyageEmbeddingService voyageEmbeddingService;
	private final Aes256Util aes256Util;
	private final ChatPromptUtil chatPromptUtil;
	private final ChatPromptTemplate chatPromptTemplate;

	@Override
	public ChatResponse chat(Long userId, ChatRequest request) {
		UserAiProviderEntity userAiProvider = userAiProviderRepository.findById(request.userAIProviderId())
			.orElseThrow();
		AiProviderEntity aiProvider = userAiProvider.getAiProvider();

		String apiKey = Optional.ofNullable(userAiProvider.getApiKey())
			.filter(key -> key != null && !key.isEmpty())
			.map(aes256Util::decrypt)
			.orElse(null);

		AiChatService aiChatService = aiChatServiceFactory.get(aiProvider.getBrand());

		float[] vector = voyageEmbeddingService.getEmbedding(request.message());
		List<ChatMemory> memories = qdrantVectorService.search(userId, vector, TOP_K);

		String SYSTEM_PROMPT = chatPromptTemplate.getSystemPrompt();

		AiChatInputDTO aiChatInputDTO = new AiChatInputDTO(
			aiProvider.getModel(), userAiProvider.getIsDefault(), userAiProvider.getTemperature(), apiKey,
			SYSTEM_PROMPT, chatPromptUtil.buildWithMemory(memories, request.message()));

		String aiResponse = aiChatService.generateChat(aiChatInputDTO);

		log.info("aiResponse: {}", aiResponse);

		qdrantVectorService.save(
			userId,
			request.message(),
			aiResponse,
			vector
		);

		return ChatResponse.from(aiResponse);
	}
}
