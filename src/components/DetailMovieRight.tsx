import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ReviewResult, getCertification, getReviews, IdMovie } from "../api";
import { useQuery } from "@tanstack/react-query";

const RightWrap = styled.div`
  position: sticky;
  top: 60px;
  background-color: ${(props) => props.theme.black.lighter};
  min-height: 800px;
  min-width: 320px;
  padding: 40px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  @media screen and (max-width: 768px) {
    gap: 10px;
    min-height: 600px;
    top: 10px;
    position: static;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.white.lighter};
  word-break: keep-all;
`;

const VoteAndAdult = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const VoteWrap = styled(motion.div)`
  display: flex;
  flex-direction: column;
  height: 80px;
  width: 100%;
  margin-top: 10px;
`;

const Wrap = styled(motion.div)`
  display: flex;
  flex-direction: column;
`;

const SubTitle = styled.h3`
  color: ${({ theme }) => theme.white.darker};
  font-weight: 400;
  margin-bottom: 14px;
  margin-left: 4px;
  @media screen and (max-width: 768px) {
    margin-bottom: 6px;
  }
`;

const GenreItem = styled.div`
  display: flex;
  gap: 2%;
`;

const Box = styled.div`
  height: 30px;
  padding: 10px 14px;
  height: 40px;
  background-color: ${({ theme }) => theme.black.veryDark};
  border-radius: 10px;
  color: ${({ theme }) => theme.white.lighter};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  text-align: center;
  cursor: pointer;
`;

// 리뷰
const ReviewHadlineWrap = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  h3 {
    margin-top: 8px;
  }
`;

const ReviewBox = styled.div`
  height: 300px;
  padding: 10px 14px;
  background-color: ${({ theme }) => theme.black.veryDark};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  @media screen and (max-width: 768px) {
    height: 200px;
  }
`;

//슬라이드 되는 영역
const Review = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 20px 10px 20px 20px;
`;

const DescWrap = styled(motion.div)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ReviewTitle = styled(motion.div)``;

const ReviewDesc = styled.div`
  color: ${({ theme }) => theme.white.darker};
  opacity: 0.8;
  height: 100%;
  width: 100%;
  overflow-wrap: break-word;
  overflow-y: scroll;
  padding-right: 6px;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.white.darker};
    opacity: 0.8;
    border-radius: 4px;
  }
`;

const DetailMovieRight = ({
  nowMovie,
  nowMovieId,
  reSize,
}: {
  nowMovie: IdMovie | undefined;
  nowMovieId: number | undefined;
  reSize: boolean;
}) => {
  const [leaving, setLeaving] = useState(false);
  const [index, setIndex] = useState(0);
  const offset = 1;

  //영화 리뷰
  const { data: reviews, isLoading: reviewsLoding } = useQuery({
    queryKey: ["reviews", nowMovieId],
    queryFn: async () => {
      if (!nowMovieId) return { results: [] };
      return await getReviews(nowMovieId);
    },
  });

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const reviewIndex = () => {
    if (reviews) {
      setLeaving(true);
      const totalReviews = reviews.results.length;
      const maxIndex = Math.ceil(totalReviews / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const rowVariants = {
    hidden: {
      x: window.innerWidth + 10,
    },
    visible: {
      x: 0,
    },
    exit: {
      x: -window.innerWidth - 10,
    },
  };

  const [certifications, setCertifications] = useState<Record<number, string>>(
    {}
  );

  useEffect(() => {
    if (nowMovie) {
      const fetchCertifications = async () => {
        const certificationData = await getCertification(nowMovie.id);

        setCertifications((prev) => ({
          ...prev,
          [certificationData.id]: certificationData.certification,
        }));
      };

      fetchCertifications();
    }
  }, [nowMovie]);

  return (
    <RightWrap>
      <Title>{nowMovie?.title}</Title>
      <VoteAndAdult>
        <VoteWrap>
          <SubTitle>⭐ 평점</SubTitle>
          <Box>{nowMovie ? nowMovie.vote_average.toFixed(1) : 0}</Box>
        </VoteWrap>
        <VoteWrap>
          <SubTitle>👥 연령등급</SubTitle>
          <Box>{certifications[nowMovie?.id || 0] || "15"}</Box>
        </VoteWrap>
      </VoteAndAdult>
      <Wrap>
        <SubTitle> ✔️ 장르</SubTitle>
        <GenreItem>
          {nowMovie?.genres.map((genre) => (
            <Box key={genre.id}>{genre.name}</Box>
          ))}
        </GenreItem>
      </Wrap>
      <Wrap>
        <ReviewHadlineWrap>
          <SubTitle>👏 리뷰</SubTitle>
          <Box onClick={reviewIndex}> {">"} </Box>
        </ReviewHadlineWrap>
        <ReviewBox>
          <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
            <Review
              key={index}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "tween", duration: 1 }}
            >
              {reviews?.results.length === 0 ? (
                <Wrap>
                  <ReviewDesc>리뷰가 없습니다</ReviewDesc>
                </Wrap>
              ) : (
                reviews?.results
                  .slice(index * offset, index * offset + offset)
                  .map((review: ReviewResult) => (
                    <DescWrap key={review.id}>
                      <ReviewTitle>
                        <SubTitle>{review.author}</SubTitle>
                      </ReviewTitle>
                      <ReviewDesc>{review.content}</ReviewDesc>
                    </DescWrap>
                  ))
              )}
            </Review>
          </AnimatePresence>
        </ReviewBox>
      </Wrap>
    </RightWrap>
  );
};

export default DetailMovieRight;
