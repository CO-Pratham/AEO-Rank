import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  setDetailLoading, 
  setError, 
  setCurrentPromptDetail, 
  clearCurrentPromptDetail,
  type PromptDetail 
} from '../store/slices/promptsSlice';
import { useBrand } from '../context/BrandContext';

export const usePromptDetail = (promptId: string | undefined) => {
  const dispatch = useAppDispatch();
  const { brand } = useBrand();
  const { currentPromptDetail, detailLoading, error } = useAppSelector(state => state.prompts);

  // Generate unique data based on prompt ID
  const generateUniqueData = (promptId: number) => {
    const seed = promptId * 1000; // Use prompt ID as seed for consistent data
    const random = (min: number, max: number) => Math.floor((seed % (max - min + 1)) + min);
    
    return {
      visibility: `${random(5, 45)}%`,
      position: `${random(1, 10)}${random(1, 10) === 1 ? 'st' : random(1, 10) === 2 ? 'nd' : random(1, 10) === 3 ? 'rd' : 'th'}`,
      impressions: random(1000, 10000),
      clicks: random(50, 500),
      ctr: parseFloat((random(20, 80) / 10).toFixed(1)),
      avgPosition: parseFloat((random(10, 50) / 10).toFixed(1)),
      totalMentions: random(100, 1000),
      avgSentiment: parseFloat((random(30, 90) / 10).toFixed(1)),
      volume: random(500, 2000),
    };
  };

  const fetchPromptDetail = async (id: string) => {
    try {
      dispatch(setDetailLoading(true));
      dispatch(setError(null));
      
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`https://aeotest-production.up.railway.app/prompts/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prompt: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Prompt detail API Response:', data);
      
      // Generate unique data for this prompt
      const uniqueData = generateUniqueData(parseInt(id));
      
      // Transform the data to match our interface
      const promptDetail: PromptDetail = {
        id: data.id || parseInt(id),
        prompt: data.prompt || data.question || data.text || `Sample prompt ${id}: What is the best solution for this specific use case?`,
        visibility: data.visibility || uniqueData.visibility,
        sentiment: data.sentiment || (uniqueData.avgSentiment > 6 ? 'Positive' : uniqueData.avgSentiment > 4 ? 'Neutral' : 'Negative'),
        position: data.position || uniqueData.position,
        mentions: data.mentions || [
          { platform: "ChatGPT", color: "bg-green-500" },
          { platform: "Claude", color: "bg-blue-500" },
          { platform: "Gemini", color: "bg-orange-500" }
        ],
        volume: data.volume || uniqueData.volume,
        tags: data.tags || ["Sample", "Demo", "Test"],
        addedAt: data.created_at ? new Date(data.created_at) : new Date(),
        competitors: data.competitors || [
          { name: "Competitor A", domain: "competitor-a.com", visibility: "25%", position: "1st" },
          { name: "Competitor B", domain: "competitor-b.com", visibility: "20%", position: "2nd" },
          { name: brand?.brand_name || "Your Brand", domain: brand?.domain || "example.com", visibility: uniqueData.visibility, position: uniqueData.position }
        ],
        analytics: {
          impressions: uniqueData.impressions,
          clicks: uniqueData.clicks,
          ctr: uniqueData.ctr,
          avgPosition: uniqueData.avgPosition,
          totalMentions: uniqueData.totalMentions,
          avgSentiment: uniqueData.avgSentiment
        },
        visibilityTrend: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visibility: Math.max(0, parseInt(uniqueData.visibility) + (Math.random() - 0.5) * 10),
          position: Math.max(1, uniqueData.avgPosition + (Math.random() - 0.5) * 2)
        })),
        platformData: [
          { platform: "ChatGPT", mentions: Math.floor(uniqueData.totalMentions * 0.4), color: "#10B981" },
          { platform: "Claude", mentions: Math.floor(uniqueData.totalMentions * 0.35), color: "#3B82F6" },
          { platform: "Gemini", mentions: Math.floor(uniqueData.totalMentions * 0.25), color: "#F59E0B" }
        ]
      };
      
      dispatch(setCurrentPromptDetail(promptDetail));
    } catch (error) {
      console.error('Error fetching prompt detail:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch prompt detail'));
      
      // Generate unique data for fallback
      const uniqueData = generateUniqueData(parseInt(id));
      
      const fallbackPrompt: PromptDetail = {
        id: parseInt(id),
        prompt: `Sample prompt ${id}: What is the best solution for this specific use case?`,
        visibility: uniqueData.visibility,
        sentiment: uniqueData.avgSentiment > 6 ? 'Positive' : uniqueData.avgSentiment > 4 ? 'Neutral' : 'Negative',
        position: uniqueData.position,
        mentions: [
          { platform: "ChatGPT", color: "bg-green-500" },
          { platform: "Claude", color: "bg-blue-500" },
          { platform: "Gemini", color: "bg-orange-500" }
        ],
        volume: uniqueData.volume,
        tags: ["Sample", "Demo", "Test"],
        addedAt: new Date(),
        competitors: [
          { name: "Competitor A", domain: "competitor-a.com", visibility: "25%", position: "1st" },
          { name: "Competitor B", domain: "competitor-b.com", visibility: "20%", position: "2nd" },
          { name: brand?.brand_name || "Your Brand", domain: brand?.domain || "example.com", visibility: uniqueData.visibility, position: uniqueData.position }
        ],
        analytics: {
          impressions: uniqueData.impressions,
          clicks: uniqueData.clicks,
          ctr: uniqueData.ctr,
          avgPosition: uniqueData.avgPosition,
          totalMentions: uniqueData.totalMentions,
          avgSentiment: uniqueData.avgSentiment
        },
        visibilityTrend: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visibility: Math.max(0, parseInt(uniqueData.visibility) + (Math.random() - 0.5) * 10),
          position: Math.max(1, uniqueData.avgPosition + (Math.random() - 0.5) * 2)
        })),
        platformData: [
          { platform: "ChatGPT", mentions: Math.floor(uniqueData.totalMentions * 0.4), color: "#10B981" },
          { platform: "Claude", mentions: Math.floor(uniqueData.totalMentions * 0.35), color: "#3B82F6" },
          { platform: "Gemini", mentions: Math.floor(uniqueData.totalMentions * 0.25), color: "#F59E0B" }
        ]
      };
      
      dispatch(setCurrentPromptDetail(fallbackPrompt));
    } finally {
      dispatch(setDetailLoading(false));
    }
  };

  useEffect(() => {
    if (promptId) {
      fetchPromptDetail(promptId);
    } else {
      dispatch(clearCurrentPromptDetail());
    }

    // Cleanup function to clear prompt detail when component unmounts
    return () => {
      dispatch(clearCurrentPromptDetail());
    };
  }, [promptId, brand, dispatch]);

  return {
    promptDetail: currentPromptDetail,
    loading: detailLoading,
    error,
    refetch: () => promptId && fetchPromptDetail(promptId)
  };
};
