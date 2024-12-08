import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { makeImagePath } from "../../utils";
import { getCredits, getMovies, Movie } from "../../api";
import { useParams } from "react-router-dom";

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

const PosterWrap = styled.div`
  width: 400px;
  height: 200px;
  overflow: hidden;
  object-fit: cover 30%;
  object-position: center;
  border-radius: 16px;
`;

const List = styled.div`
  font-size: 1.6rem;
`;

const TitleWrap = styled.div`
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

// const ImgWrap = styled.div`
//   display: flex;
//   max-width: 1300px;
//   height: 280px;
//   padding: 14px 80px;
//   margin: 20px auto;
//   justify-content: space-between;
//   background-color: ${({ theme }) => theme.black.veryDark};
//   border-radius: 16px;
//   overflow: hidden;
//   position: relative;
// `;

const ImgWrap = styled.div`
  max-width: 1300px;
  height: 240px;
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

const Slider = styled(motion.div)`
  position: absolute;
  width: 100%;
  max-width: 1000px;
  display: flex;
  justify-content: center;
  justify-items: center;
  gap: 10px;
`;

const SliderWrap = styled.div`
  height: 100%;
  div:nth-child(1) {
    // 이미지 사이즈
    width: 300px;
    height: 180px;
  }
`;

const Name = styled.h5`
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

const RandomMovieSlide = ({
  reSize,
  middleSize,
}: {
  reSize: boolean;
  middleSize: boolean;
}) => {
  const [leaving, setLeaving] = useState(false);
  const [index, setIndex] = useState(0);
  const [offset, setOffSet] = useState(3); // offset - 페이지
  const [right, setRight] = useState(false);
  const [randomMoive, setRamdomMovie] = useState<Movie[]>([]);

  useEffect(() => {
    if (!middleSize && !reSize) {
      setOffSet(3);
    } else if (middleSize) {
      setOffSet(2);
    } else if (reSize) {
      setOffSet(1);
    }
  }, [reSize, middleSize]);

  //영화
  const { data: movies, isLoading: loading } = useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      return await getMovies();
    },
  });
  //렌덤 영화 스토리지 저장
  useEffect(() => {
    if (movies?.results) {
      const storedMovies = localStorage.getItem("randomMovies");

      if (storedMovies) {
        // 로컬 저장소에 저장된 데이터가 있으면 복원
        setRamdomMovie(JSON.parse(storedMovies));
      } else {
        // 로컬 저장소에 데이터가 없으면 랜덤 데이터를 생성
        const shuffled = [...movies.results].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 12);
        setRamdomMovie(selected);

        // 로컬 저장소에 저장
        localStorage.setItem("randomMovies", JSON.stringify(selected));
      }
    }
  }, [movies]);

  //슬라이드
  const toggleRandom = () => setLeaving((prev) => !prev);

  const crewIndexFn = (bt: string) => {
    if (movies) {
      if (leaving) return;
      setLeaving(true);

      const total = randomMoive.length;
      const castmaxIndex = Math.ceil(total / offset) - 1;
      if (bt === "right") {
        setRight(true);
        setIndex((prev) => (prev === castmaxIndex ? 0 : prev + 1));
      } else {
        setRight(false);
        setIndex((prev) => (prev === 0 ? castmaxIndex : prev - 1));
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
    <List>
      <TitleWrap>
        <Title>추천 영화</Title>
        <Arrow>
          <Box onClick={() => crewIndexFn("left")}>{"<"}</Box>
          <Box onClick={() => crewIndexFn("right")}>{">"}</Box>
        </Arrow>
      </TitleWrap>
      <ImgWrap>
        <AnimatePresence
          initial={false}
          custom={right}
          onExitComplete={toggleRandom}
        >
          <Slider
            key={index}
            custom={right}
            variants={sliderVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 1, type: "tween" }}
          >
            {randomMoive
              .slice(index * offset, index * offset + offset)
              .map((movie) => (
                <SliderWrap key={movie.id}>
                  <Box>
                    <PosterWrap>
                      <img
                        src={makeImagePath(movie.poster_path)}
                        width={"100%"}
                      />
                    </PosterWrap>
                  </Box>
                  <Wrap>
                    <Name>{movie.title}</Name>
                    {/* <CharacName>{cast.character}</CharacName> */}
                  </Wrap>
                </SliderWrap>
              ))}
          </Slider>
        </AnimatePresence>
      </ImgWrap>
    </List>
  );
};

export default RandomMovieSlide;
