import React, { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';

export const StoryPanel: React.FC = () => {
  const { gameState, result, painting, currentRoundIndex } = useGame();
  const [wikiDescription, setWikiDescription] = useState<string | null>(null);
  const [loadingWiki, setLoadingWiki] = useState(false);
  const [wikiTitle, setWikiTitle] = useState<string | null>(null);

  const shouldShow = gameState === 'submitted' && result && !result.correct;

  // Prefer round-specific wikiLink, fallback to painting.wikiLink
  let roundWikiLink = painting?.rounds?.[currentRoundIndex]?.wikiLink || painting?.wikiLink;

  // Filter out Wikidata URLs so they never appear in the front end
  if (roundWikiLink?.includes('wikidata.org')) {
    roundWikiLink = undefined;
  }

  useEffect(() => {
    const fetchWiki = async () => {
      const link = roundWikiLink;
      const match = link?.match(/wiki\/([^#?]+)/);
      const title = match ? decodeURIComponent(match[1]).replace(/_/g, ' ') : null;
      setWikiTitle(title);

      if (title) {
        setLoadingWiki(true);
        try {
          const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.extract_html) {
              const match = data.extract_html.match(/<p>([\s\S]*?)<\/p>/i);
              setWikiDescription(match ? `<p>${match[1]}</p>` : null);
            } else if (data.extract) {
              setWikiDescription(`<p>${data.extract}</p>`);
            } else {
              setWikiDescription(null);
            }
          } else {
            setWikiDescription(null);
          }
        } catch {
          setWikiDescription(null);
        } finally {
          setLoadingWiki(false);
        }
      } else {
        setWikiDescription(null);
      }
    };

    fetchWiki();
  }, [roundWikiLink]);

  if (!shouldShow) return null;

  return (
    <div className="w-full mb-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-sm font-outfit">
        <div className="text-center mb-3">
          <h3 className="text-xl font-bold text-gray-800">
            {wikiTitle || painting?.title}
          </h3>
        </div>

        <div className="space-y-2 text-gray-700 text-xs leading-relaxed">
          {loadingWiki ? (
            <p className="italic text-gray-500">Loading Wikipedia description...</p>
          ) : wikiDescription ? (
            <button
              type="button"
              className="w-full text-left bg-transparent border-none outline-none p-0 m-0 transition-colors rounded hover:bg-blue-50  cursor-pointer mt-2"
              onClick={() => window.open(roundWikiLink, '_blank', 'noopener,noreferrer')}
            >
              <span dangerouslySetInnerHTML={{ __html: wikiDescription }} />
            </button>
          ) : (
            <span className="italic text-gray-500">
              [No Wikipedia description found.]
            </span>
          )}

          {painting && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-xs sm:text-base text-blue-800 font-semibold">
                <strong className="text-sm sm:text-lg">Answer: </strong>
                {painting.rounds[currentRoundIndex].location.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
