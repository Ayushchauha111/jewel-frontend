import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useInView } from "react-intersection-observer";
import { FaPlay, FaYoutube, FaExternalLinkAlt } from "react-icons/fa";

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const VideosSection = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(180deg, #050507 0%, #0d0d1a 50%, #050507 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #ff0000, transparent);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  z-index: 2;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  .youtube-icon {
    color: #ff0000;
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  span {
    background: linear-gradient(135deg, #ff0000 0%, #ff4444 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const VideosContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

// Featured Video (large)
const FeaturedVideo = styled.div`
  margin-bottom: 3rem;
  position: relative;
`;

const FeaturedVideoCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  min-height: 400px;
  transition: all 0.4s ease;

  &:hover {
    border-color: rgba(255, 0, 0, 0.3);
    box-shadow: 0 20px 60px rgba(255, 0, 0, 0.1);
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const FeaturedThumbnail = styled.div`
  position: relative;
  background: #0a0a0a;
  cursor: pointer;
  overflow: hidden;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, transparent 50%);
    z-index: 1;
  }

  @media (max-width: 900px) {
    min-height: 250px;
  }
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(255, 0, 0, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 10px 40px rgba(255, 0, 0, 0.4);

  svg {
    font-size: 2rem;
    color: white;
    margin-left: 5px;
  }

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 15px 50px rgba(255, 0, 0, 0.5);
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    
    svg {
      font-size: 1.5rem;
    }
  }
`;

const FeaturedContent = styled.div`
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 900px) {
    padding: 1.5rem;
  }
`;

const FeaturedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: fit-content;
  margin-bottom: 1.5rem;
`;

const FeaturedTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1rem;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const FeaturedDescription = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  margin: 0 0 1.5rem;
`;

const WatchButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.875rem 1.5rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  width: fit-content;

  &:hover {
    background: #ff0000;
    border-color: #ff0000;
    transform: translateX(5px);
  }

  svg {
    font-size: 0.8rem;
  }
`;

// Video Grid
const VideosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const VideoCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;
  opacity: ${props => props.$inView ? 1 : 0};
  transform: ${props => props.$inView ? 'translateY(0)' : 'translateY(30px)'};
  transition: opacity 0.6s ease-out, transform 0.6s ease-out, border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: rgba(255, 0, 0, 0.4);
    box-shadow: 0 15px 40px rgba(255, 0, 0, 0.15);
    transform: ${props => props.$inView ? 'translateY(-10px)' : 'translateY(30px)'};

    .thumbnail img {
      transform: scale(1.1);
    }

    .play-icon {
      transform: translate(-50%, -50%) scale(1.1);
      background: #ff0000;
    }
  }
`;

const VideoThumbnail = styled.div`
  position: relative;
  padding-top: 56.25%;
  background: #0a0a0a;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 50%);
  }
`;

const SmallPlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.3s ease;

  svg {
    font-size: 1.2rem;
    color: white;
    margin-left: 3px;
  }
`;

const VideoDuration = styled.span`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 2;
`;

const VideoInfo = styled.div`
  padding: 1.25rem;
`;

const VideoTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const VideoMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);

  span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

// Floating elements
const FloatingElement = styled.div`
  position: absolute;
  opacity: 0.1;
  animation: ${float} 20s ease-in-out infinite;
  z-index: 1;

  &:nth-child(1) {
    top: 10%;
    left: 5%;
    animation-delay: 0s;
  }

  &:nth-child(2) {
    top: 60%;
    right: 8%;
    animation-delay: -5s;
  }

  &:nth-child(3) {
    bottom: 15%;
    left: 15%;
    animation-delay: -10s;
  }
`;

// Video Modal
const VideoModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 1000px;
  aspect-ratio: 16/9;
  position: relative;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: -50px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: #ff0000;
  }
`;

const VideoCardWithObserver = ({ video, index, onPlay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <VideoCard 
      ref={ref}
      $inView={inView}
      style={{ transitionDelay: `${index * 0.15}s` }}
      onClick={() => onPlay(video.embedId)}
    >
      <VideoThumbnail className="thumbnail">
        <img 
          src={`https://img.youtube.com/vi/${video.embedId}/maxresdefault.jpg`}
          alt={`${video.title} - Typogram typing tutorial video`}
          loading="lazy"
          width="320"
          height="180"
          onError={(e) => {
            e.target.src = `https://img.youtube.com/vi/${video.embedId}/hqdefault.jpg`;
          }}
        />
        <SmallPlayButton className="play-icon">
          <FaPlay />
        </SmallPlayButton>
        <VideoDuration>{video.duration}</VideoDuration>
      </VideoThumbnail>
      <VideoInfo>
        <VideoTitle>{video.title}</VideoTitle>
        <VideoMeta>
          <span><FaYoutube /> Typogram</span>
        </VideoMeta>
      </VideoInfo>
    </VideoCard>
  );
};

const YouTubeVideos = () => {
  const [playingVideo, setPlayingVideo] = useState(null);

  const videos = [
    {
      id: "video1",
      title: "Typogram Introduction - Complete Platform Demo",
      description: "Learn how to use Typogram for your SSC, RRB, and Banking exam preparation. This comprehensive guide covers all features.",
      embedId: "YDBQnLmRHVU",
      duration: "8:24",
      featured: true
    },
    {
      id: "video2",
      title: "How to Login & Sign Up",
      embedId: "cm7ISsnbf1s",
      duration: "3:15"
    },
    {
      id: "video3",
      title: "Typogram Logo Reveal",
      embedId: "YdrE8vSpHgI",
      duration: "0:32"
    }
  ];

  const featuredVideo = videos.find(v => v.featured);
  const otherVideos = videos.filter(v => !v.featured);

  return (
    <VideosSection>
      {/* Floating decorations */}
      <FloatingElement>
        <FaYoutube size={80} color="#ff0000" />
      </FloatingElement>
      <FloatingElement>
        <FaPlay size={40} color="#fff" />
      </FloatingElement>
      <FloatingElement>
        <FaYoutube size={60} color="#ff0000" />
      </FloatingElement>

      <SectionHeader>
        <SectionTitle>
          <FaYoutube className="youtube-icon" />
          Watch & <span>Learn</span>
        </SectionTitle>
        <SectionSubtitle>
          Explore our video tutorials to master Typogram and ace your typing exams
        </SectionSubtitle>
      </SectionHeader>
      
      {/* VideoObject Schema for SEO */}
      {featuredVideo && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": featuredVideo.title,
            "description": featuredVideo.description || "Typogram typing tutorial video",
            "thumbnailUrl": `https://img.youtube.com/vi/${featuredVideo.embedId}/maxresdefault.jpg`,
            "uploadDate": "2024-01-01",
            "contentUrl": `https://www.youtube.com/watch?v=${featuredVideo.embedId}`,
            "embedUrl": `https://www.youtube.com/embed/${featuredVideo.embedId}`
          })}
        </script>
      )}

      <VideosContainer>
        {/* Featured Video */}
        {featuredVideo && (
          <FeaturedVideo>
            <FeaturedVideoCard>
              <FeaturedThumbnail onClick={() => setPlayingVideo(featuredVideo.embedId)}>
                <img 
                  src={`https://img.youtube.com/vi/${featuredVideo.embedId}/hqdefault.jpg`}
                  alt={`${featuredVideo.title} - Featured Typogram typing tutorial video`}
                  loading="eager"
                  width="640"
                  height="360"
                  style={{ background: '#1a1a1a' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <PlayButton>
                  <FaPlay />
                </PlayButton>
              </FeaturedThumbnail>
              <FeaturedContent>
                <FeaturedBadge>
                  <FaPlay size={10} /> Featured Video
                </FeaturedBadge>
                <FeaturedTitle>{featuredVideo.title}</FeaturedTitle>
                <FeaturedDescription>
                  {featuredVideo.description}
                </FeaturedDescription>
                <WatchButton 
                  href={`https://www.youtube.com/watch?v=${featuredVideo.embedId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube <FaExternalLinkAlt />
                </WatchButton>
              </FeaturedContent>
            </FeaturedVideoCard>
          </FeaturedVideo>
        )}

        {/* Other Videos */}
        <VideosGrid>
          {otherVideos.map((video, index) => (
            <VideoCardWithObserver 
              key={video.id} 
              video={video} 
              index={index}
              onPlay={setPlayingVideo}
            />
          ))}
        </VideosGrid>
      </VideosContainer>

      {/* Video Modal */}
      {playingVideo && (
        <VideoModal onClick={() => setPlayingVideo(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setPlayingVideo(null)}>×</CloseButton>
            <iframe
              src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </ModalContent>
        </VideoModal>
      )}
    </VideosSection>
  );
};

export default YouTubeVideos;
