import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { makeImagePath } from "../../utils";
import { getCertificationsForMovies, getMovies, Movie } from "../../api";
import { useNavigate } from "react-router-dom";

interface CustomProps {
  istype: string;
}

const List = styled.div`
  font-size: 1.6rem;
  height: 100%;
  width: 100%;
`;

const TitleWrap = styled.div`
  max-width: 1300px;
  display: flex;
  justify-content: space-between;
  margin: 0 auto 10px;
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.white.lighter};
  word-break: keep-all;
  font-weight: 400;
  font-size: 26px;
`;

const Arrow = styled.div`
  display: flex;
  gap: 10px;
  cursor: pointer;
`;

const Box = styled.div`
  width: 40px;
  height: 50px;
  padding: 10px 14px;
  background-color: ${({ theme }) => theme.black.veryDark};
  border-radius: 10px;
  color: ${({ theme }) => theme.white.lighter};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

const PostBox = styled.div<CustomProps>`
  width: ${(prosp) => (prosp.istype === "Search" ? "240px" : "300px")};
  height: 180px;
  background-color: ${({ theme }) => theme.black.veryDark};
  border-radius: 10px;
  color: ${({ theme }) => theme.white.lighter};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  margin-bottom: ${(prosp) => (prosp.istype === "Search" ? "10px" : "0px")};
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  color: ${(props) => props.theme.white.lighter};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  backdrop-filter: blur(2px);
  div {
    display: flex;
    gap: 10px;
  }

  .title {
    font-size: 16px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .age-restriction {
    font-size: 14px;
    padding: 2px 5px;
    color: white;
    border-radius: 4px;
    font-weight: bold;
    background: ${(props) => props.theme.blue.lighter};
  }
`;

const ImgWrap = styled.div`
  max-width: 100%;
  height: 70%;
  padding: 20px;
  display: flex;
  justify-content: center;
  justify-items: center;
  padding-top: 14px;
  /* margin: 20px auto; */
  margin: 0 auto;
  background-color: ${({ theme }) => theme.black.veryDark};
  border-radius: 16px;
  overflow: hidden;
  position: relative;
`;

const Slider = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== "istype",
})<CustomProps>`
  position: absolute;
  width: 100%;
  max-width: 1000px;
  display: flex;
  justify-content: center;
  justify-items: center;
  /* flex-direction: column; */
  gap: 10px;
  ${(props) => (props.istype === "Search" ? "flex-direction: column" : "")}
`;

const SliderWrap = styled.div`
  height: 100%;
  margin: 0 auto;
`;

const PosterWrap = styled.div`
  width: 400px;
  height: 200px;
  overflow: hidden;
  object-fit: cover 30%;
  object-position: center;
  border-radius: 16px;
`;

const Name = styled.h5`
  margin-top: 6px;
  font-size: 16px;
  text-align: center;
  color: ${({ theme }) => theme.white.darker};
`;

const RandomMovieSlide = ({
  reSize,
  middleSize,
  type,
}: {
  reSize: boolean;
  middleSize: boolean;
  type: string;
}) => {
  const [leaving, setLeaving] = useState(false);
  const [index, setIndex] = useState(0);
  const [offset] = useState(3);
  const [right, setRight] = useState(false);
  const [randomMovie, setRandomMovie] = useState<Movie[]>([]);
  const [moviesWithCertifications, setMoviesWithCertifications] = useState<
    Movie[]
  >([]);
  const navigate = useNavigate();

  const fetchMoviesWithCertifications = useCallback(async () => {
    if (randomMovie.length > 0) {
      const movieIds = randomMovie.map((movie) => movie.id);

      const certificationsArray = await getCertificationsForMovies(movieIds);

      const certificationsMap = certificationsArray.reduce(
        (acc, { id, certification }) => {
          acc[id] = certification || "미정";
          return acc;
        },
        {} as Record<number, string>
      );

      const updatedMovies = randomMovie.map((movie) => ({
        ...movie,
        certification: certificationsMap[movie.id],
      }));

      setMoviesWithCertifications(updatedMovies);
    }
  }, [randomMovie]);

  useEffect(() => {
    fetchMoviesWithCertifications();
  }, [fetchMoviesWithCertifications]);

  const { data: movies } = useQuery({
    queryKey: ["movies"],
    queryFn: getMovies,
  });

  useEffect(() => {
    if (movies?.results) {
      const storedMovies = localStorage.getItem("randomMovies");

      if (storedMovies) {
        setRandomMovie(JSON.parse(storedMovies));
      } else {
        const shuffled = [...movies.results].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 12);
        setRandomMovie(selected);
        localStorage.setItem("randomMovies", JSON.stringify(selected));
      }
    }
  }, [movies]);

  // Slider navigation logic
  const toggleRandom = () => setLeaving((prev) => !prev);

  const crewIndexFn = (bt: string) => {
    if (moviesWithCertifications.length > 0) {
      if (leaving) return;
      setLeaving(true);

      const total = moviesWithCertifications.length;
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

  const onDetail = (movieId: number | undefined) => {
    if (!movieId) {
      alert("해당 영화 정보를 찾을 수 없습니다.");
      return;
    }

    navigate(`/movies/${movieId}`);
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
            istype={type}
          >
            {moviesWithCertifications
              .slice(index * offset, index * offset + offset)
              .map((movie) => (
                <SliderWrap key={movie.id}>
                  <PostBox onClick={() => onDetail(movie.id)} istype={type}>
                    <PosterWrap>
                      <img
                        src={makeImagePath(movie.poster_path)}
                        width={"100%"}
                        alt={movie.title}
                      />
                    </PosterWrap>
                    <Overlay>
                      <Name className="title">{movie.title}</Name>
                      <div className="age-restriction">
                        {movie.certification || "미정"}
                      </div>
                    </Overlay>
                  </PostBox>
                </SliderWrap>
              ))}
          </Slider>
        </AnimatePresence>
      </ImgWrap>
    </List>
  );
};

export default RandomMovieSlide;
