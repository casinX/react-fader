import propTypes from 'prop-types';
import React from 'react';


class Fader extends React.PureComponent {
  constructor(props) {
    super(props);

    const { isHidden, isAnimateOnMount } = this.props;

    const initialState = {};

    if(isHidden){
      if(isAnimateOnMount){
        initialState.isInDOM = true;
        initialState.isHidden = false;
      }else{
        initialState.isInDOM = false;
        initialState.isHidden = true;
      }
    }else{
      if(isAnimateOnMount){
        initialState.isInDOM = false;
        initialState.isHidden = true;
      }else{
        initialState.isInDOM = true;
        initialState.isHidden = false;
      }
    }

    this.state = initialState;

    this.childRef = null;

    this.fadeInLoopTimeout = null;
    this.fadeOutLoopTimeout = null;
  }

  setChildRef = (ref) => {
    this.childRef = ref;
  };

  stopFadeInLoop = () => {
    if(this.fadeInLoopTimeout !== null){
      clearTimeout(this.fadeInLoopTimeout);
      this.fadeInLoopTimeout = null;
    }
  };

  stopFadeOutLoop = () => {
    if(this.fadeOutLoopTimeout !== null){
      clearTimeout(this.fadeOutLoopTimeout);
      this.fadeOutLoopTimeout = null;
    }
  };

  startFadeInLoop = () => {
    this.stopFadeOutLoop();
    this.loopToFadeIn();
  };

  startFadeOutLoop = () => {
    this.stopFadeInLoop();
    this.loopToFadeOut();
  };

  loopToFadeIn = () => {
    const { isInDOM } = this.state;
    const { FPS } = this.props;

    if(window.document.body.contains(this.childRef)){
      this.setState({ isInDOM: true, isHidden: false });
      this.stopFadeInLoop();
      return;
    }

    if(!isInDOM){
      this.setState({ isInDOM: true, isHidden: true });
    }

    this.fadeInLoopTimeout = setTimeout(this.loopToFadeIn, 1000/FPS);
  };

  loopToFadeOut = () => {
    const { isInDOM, isHidden } = this.state;
    const { checkIsHidden, FPS } = this.props;

    if(isHidden && isInDOM && checkIsHidden(window.getComputedStyle(this.childRef))){
      this.setState({ isInDOM: false, isHidden: true });
      this.stopFadeOutLoop();
      return;
    }

    if(!isHidden){
      this.setState({ isInDOM: true, isHidden: true });
    }

    this.fadeOutLoopTimeout = setTimeout(this.loopToFadeOut, 1000/FPS);
  };

  componentDidMount = () => {
    const { isHidden, isAnimateOnMount } = this.props;

    if(isAnimateOnMount){
      if(!isHidden){
        this.startFadeInLoop();
      }else{
        this.startFadeOutLoop();
      }
    }
  };

  componentWillReceiveProps(nextProps) {
    const { isHidden } = this.props;
    const { isHidden: isHiddenNext } = nextProps;

    if(isHidden && !isHiddenNext){
      this.startFadeInLoop();
    }

    if(!isHidden && isHiddenNext){
      this.startFadeOutLoop();
    }
  }

  render() {
    const {
      render,
    } = this.props;

    const {
      isInDOM,
      isHidden
    } = this.state;

    return isInDOM ? render(this.setChildRef, isHidden) : null;
  }

  componentWillUnmount = () => {
    this.stopFadeInLoop();
    this.stopFadeOutLoop();
  };
}


Fader.propTypes = {
  render: propTypes.func.isRequired,
  isHidden: propTypes.bool.isRequired,
  FPS: propTypes.number,
  checkIsHidden: propTypes.func,
  isAnimateOnMount: propTypes.bool
};

Fader.defaultProps = {
  isAnimateOnMount: true,
  FPS: 30,
  checkIsHidden: (computedStyle) => {
    return computedStyle.opacity === '0';
  },
};


export default Fader;