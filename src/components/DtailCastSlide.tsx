import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { makeImagePath } from "../utils";
import { getCredits } from "../api";

const Title = styled.h3`
  color: ${({ theme }) => theme.white.lighter};
  word-break: keep-all;
  margin-top: 10px;
`;
const Wrap = styled(motion.div)``;

const Box = styled.div`
  height: 30px;
  padding: 10px 14px;
  height: auto;
  background-color: ${({ theme }) => theme.black.veryDark};
  border-radius: 10px;
  color: ${({ theme }) => theme.white.lighter};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const CrewList = styled.div`
  font-size: 1.6rem;
`;

const CrewTitleWrap = styled.div`
  max-width: 1300px;
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
`;

const Arrow = styled.div`
  display: flex;
  gap: 10px;
  cursor: pointer;
`;

const CrewImgWrap = styled.div`
  max-width: 1300px;
  min-height: 220px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 14px;
  margin: 20px auto;
  background-color: ${({ theme }) => theme.black.veryDark};
  border-radius: 16px;
  overflow: hidden;
  position: relative;
`;

const CrewSlider = styled(motion.div)`
  position: absolute;
  width: 100%;
  max-width: 1000px;
  display: flex;
  justify-content: center;
  justify-items: center;
  gap: 3%;
`;

const CrewSliderWrap = styled.div`
  height: 100%;
  max-width: 140px;
  div:nth-child(1) {
    //이미지 사이즈
    width: 140px;
    height: 140px;
  }
`;

const CrewName = styled.h5`
  margin-top: 6px;
  font-size: 16px;
  text-align: center;
  color: ${({ theme }) => theme.white.darker};
`;

const CharacName = styled.div`
  margin-top: 6px;
  font-size: 12px;
  text-align: center;
  color: ${({ theme }) => theme.white.darker};
  opacity: 0.6;
`;

interface castType {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}
const DtailCastSlide = ({
  nowMovieId,
  reSize,
  middleSize,
}: {
  nowMovieId: number | undefined;
  reSize: boolean;
  middleSize: boolean;
}) => {
  const [leavingCrew, setLeavingCrew] = useState(false);
  const [crewIndex, setCrewIndex] = useState(0);
  const [right, setRight] = useState(false);
  const [offset2, setOffset2] = useState(5);

  useEffect(() => {
    if (!middleSize && !reSize) {
      setOffset2(5);
    } else if (middleSize) {
      setOffset2(3);
    } else if (reSize) {
      setOffset2(1);
    }
  }, [reSize, middleSize]);

  //영화 출연진
  const { data: credits, isLoading: creditsLoding } = useQuery({
    queryKey: ["credits", nowMovieId],
    queryFn: async () => {
      if (!nowMovieId) return { results: [] };
      return await getCredits(nowMovieId);
    },
  });
  //출연진 슬라이드
  const toggleCrew = () => setLeavingCrew((prev) => !prev);

  const crewIndexFn = async (bt: string) => {
    if (credits) {
      //사용할 data 값 - 15명의 배우들
      if (leavingCrew) return;
      setLeavingCrew(true);

      const castsLeng = await credits.cast.slice(0, 15).length;
      const castmaxIndex = Math.ceil(castsLeng / offset2) - 1;
      if (bt === "right") {
        setRight(true);
        setCrewIndex((prev) => (prev === castmaxIndex ? 0 : prev + 1));
      } else {
        setRight(false);
        setCrewIndex((prev) => (prev === 0 ? castmaxIndex : prev - 1));
      }
    }
  };

  const sliderVariants = {
    hidden: (custom: boolean) => ({
      x: custom ? window.innerWidth + 10 : -window.innerWidth - 10,
    }),
    visible: {
      x: 0,
    },
    exit: (custom: boolean) => ({
      x: custom ? -window.innerWidth - 10 : window.innerWidth + 10,
    }),
  };

  return (
    <CrewList>
      <CrewTitleWrap>
        <Title>출연 배우</Title>
        <Arrow>
          <Box onClick={() => crewIndexFn("left")}>{"<"}</Box>
          <Box onClick={() => crewIndexFn("right")}>{">"}</Box>
        </Arrow>
      </CrewTitleWrap>
      <CrewImgWrap>
        <AnimatePresence
          initial={false}
          custom={right}
          onExitComplete={toggleCrew}
        >
          <CrewSlider
            key={crewIndex}
            custom={right}
            variants={sliderVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 1, type: "tween" }}
          >
            {credits?.cast
              .slice(0, 15)
              .slice(crewIndex * offset2, crewIndex * offset2 + offset2)
              .map((cast: castType) => (
                <CrewSliderWrap key={cast.id}>
                  <Box>
                    {cast.profile_path ? (
                      <img
                        src={makeImagePath(cast.profile_path)}
                        width={"140px"}
                      />
                    ) : (
                      <img
                        src={`${process.env.PUBLIC_URL}/nonImg.jpg`}
                        width={"140px"}
                      />
                    )}
                  </Box>
                  <Wrap>
                    <CrewName>{cast.name}</CrewName>
                    <CharacName>{cast.character}</CharacName>
                  </Wrap>
                </CrewSliderWrap>
              ))}
          </CrewSlider>
        </AnimatePresence>
      </CrewImgWrap>
    </CrewList>
  );
};

export default React.memo(DtailCastSlide);
