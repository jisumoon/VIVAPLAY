import { ReactComponent as VivaPlayLogo } from "../vivaplay.svg";
import styled, { keyframes } from "styled-components";

const move = keyframes`
  0% {
    transform: translateY(0) rotate(90deg);
  }
  50% {
    transform: translateY(-10%) rotate(180deg);
  }
  100% {
    transform: translateY(-20%) rotate(360deg);
  }
`;

const move2 = keyframes`
  0% {
    transform: translateY(-12%) rotate(60deg);
  }
  25% {
    transform: translateY(-22%) rotate(180deg);
  }
  50% {
    transform: translateY(-32%) rotate(60deg);
  }
  75% {
    transform: translateY(-42%) rotate(180deg);
  }
  100% {
    transform: translateY(-56%) rotate(360deg);
  }
`;

const textGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 10px #ffffff, 0 0 20px #0078ff, 0 0 30px #0078ff, 0 0 40px #0078ff;
    opacity: 1;
  }
  50% {
    text-shadow: 0 0 15px #ffffff, 0 0 30px #0078ff, 0 0 45px #0078ff, 0 0 60px #0078ff;
    opacity: 0.8;
  }
`;

const Container = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(360deg, #2954cc 0%, #067fda 100%);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Inner = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 200px;
    height: 200px;
    position: relative;
    overflow: hidden;
    transform: translate3d(0, 0, 0);
    &:nth-child(1) {
      position: absolute;
      stroke: #2954cc;
      stroke-width: 2.5;
      z-index: 10;
      path {
        fill: none;
      }
    }
    &:nth-child(2) {
      position: absolute;
    }
  }

  .wave-two {
    width: 700px;
    height: 700px;
    position: absolute;
    bottom: -200%;
    left: -90%;
    border-radius: 55%;
    background: black;
    animation: ${move} 3s infinite linear;
    z-index: -20;
  }

  .wave-one {
    width: 700px;
    height: 700px;
    position: absolute;
    bottom: -70%;
    left: -150%;
    border-radius: 40%;
    background: black;
    animation: ${move2} 4s infinite linear;
    z-index: 8;
  }
`;

const LoadingText = styled.div`
  font-size: 30px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 10px;
  animation: ${textGlow} 2s infinite;
`;

const Loading = () => {
  return (
    <Container>
      <Inner>
        <Wrapper>
          <VivaPlayLogo className="logo" />
          <div className="wave-one"></div>
          <div className="wave-two"></div>
          <VivaPlayLogo className="logostroke" />
        </Wrapper>
        <LoadingText>VIVAPLAY</LoadingText>
      </Inner>
    </Container>
  );
};

export default Loading;
