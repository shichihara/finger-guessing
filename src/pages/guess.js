import React, { Component } from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { 
  faHandRock,
  faHandScissors,
  faHandPaper,
} from '@fortawesome/free-solid-svg-icons'
import Header from "../components/Header";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      isfinish: false,
      role: '',
      player1: '',
      player2: '',
      winner: '',
      content: '',
      readError: null,
      writeError: null,
    };
    this.handleReset = this.handleReset.bind(this);
    this.handleForceReset = this.handleForceReset.bind(this);
    this.chooseHand = [
      this.onRadioPress.bind(this, 'paper'),
      this.onRadioPress.bind(this, 'rock'),
      this.onRadioPress.bind(this, 'scissors'),
    ];
  }

  async componentDidMount() {
    this.setupBeforeUnloadListener();
    this.setState({ readError: null});
    // const chatArea = this.myRef.current;
    try {
      db.collection('game').onSnapshot(querySnapshot => {
        querySnapshot.forEach((doc) => {
          if (doc.id === 'guess') {
            let recivedData = doc.data();
            this.handleJudge(recivedData);
          }
        });
      });
    } catch (error) {
      this.setState({ readError: error.message});
    }
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.handleForceReset);
  }

  async handleForceReset(ev) {
      ev.preventDefault();
      if (this.state.player1 !== '' || this.state.player2 !== '') {
        try {
          db.collection('game').doc('guess').update({
            player1: '',
            player2: '',
            winner: ''
          });
        } catch (error) {
          this.setState({ readError: error.message});
        }
      }
  }
    

  setupBeforeUnloadListener = () => {
    window.addEventListener("beforeunload", this.handleForceReset);
  }

  async handleReset(event) {
    event.preventDefault();
    db.collection('game').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        if (doc.id === 'guess') {
          let data = doc.data();
          if (data.winner !== '') {
            db.collection('game').doc('guess').update({
              player1: '',
              player2: '',
              winner: ''
            });
          }
          this.setState({
            role: '',
            player1: '',
            player2: '',
            content: '',
          });
        }
      });
    });
  }

  async handleJudge (data) {
    let role = this.state.role;
    let content = this.state.content;
    let winner = this.state.winner;
    let isfinish = this.state.isfinish;
    if ((data.player1 === '' && data.player2 === '' && data.winner === '') && isfinish === true) {
      this.setState({
        role: '',
        player1: '',
        player2: '',
        winner: '',
        content: '',
        isfinish: false,
      });
    }
    if (data.player1 !== '' && data.player2 !== '') {
      if (role === 'player1') {
        if (content === data.player2) {
          winner = 'draw';
        } else if (content === 'paper') {
          if (data.player2 === 'rock') {
            winner = 'player1';
          } else {
            winner = 'player2';
          }
        } else if (content === 'rock') {
          if (data.player2 === 'scissors') {
            winner = 'player1';
          } else {
            winner = 'player2';
          }
        } else if (content === 'scissors') {
          if (data.player2 === 'paper') {
            winner = 'player1';
          } else {
            winner = 'player2';
          }
        }
      } else if (role === 'player2'){
        if (content === data.player1) {
          winner = 'draw';
        } else if (content === 'paper') {
          if (data.player1 === 'rock') {
            winner = 'player2';
          } else {
            winner = 'player1';
          }
        } else if (content === 'rock') {
          if (data.player1 === 'scissors') {
            winner = 'player2';
          } else {
            winner = 'player1';
          }
        } else if (content === 'scissors') {
          if (data.player1 === 'paper') {
            winner = 'player2';
          } else {
            winner = 'player1';
          }
        }
      }
      if (winner !== '') {
        db.collection('game').doc('guess').update({
          winner: winner,
        });
      }
      this.setState({
        player1: data.player1,
        player2: data.player2,
        winner: winner
      });
    } else {
      this.setState({
        player1: data.player1,
        player2: data.player2,
        winner: data.winner
      });
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ writeError: null });
    // const chatArea = this.myRef.current;
    try {
      if (this.state.player1 === '') {
        await db.collection('game').doc('guess').update({
          player1: this.state.content,
        });
      } else {
        await db.collection('game').doc('guess').update({
          player2: this.state.content,
        });
      }
      this.setState({ content: '' });
      // chatArea.scrollBy(0, chatArea.scrollHeight);
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }

  async onRadioPress(value) {
    let role = '';
    if (this.state.role === 'player1') {
      role = this.state.role;
      await db.collection('game').doc('guess').update({
        player1: value,
      });
    } else if (this.state.role === 'player2') {
      role = this.state.role;
      await db.collection('game').doc('guess').update({
        player2: value,
      });
    } else {
      if (this.state.player1 === "") {
        await db.collection('game').doc('guess').update({
          player1: value,
        });
        role = 'player1';
      } else if (this.state.player1 !== "" && this.state.player2 === ""){
        await db.collection('game').doc('guess').update({
          player2: value,
        });
        role = 'player2';
      }
    }
   
    this.setState({
      content: value,
      role: role,
      isfinish: true,
    });
  }

  renderLoading() {
    return (
      <div className='loading'>
        <div className="spinner-border text-success" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <Header />
        <div className="result-area align-items-center">
        {
          this.state.content !== ""
          ? <div className="user-side">
              <div>
                Your Hand
              </div>
              <label className="result-label">
                <FontAwesomeIcon
                  icon={
                    this.state.content === 'paper'
                    ? faHandPaper
                    : this.state.content === 'rock'
                      ? faHandRock
                      : faHandScissors
                  }
                />
              </label>
            </div>
          : <div>
            
          </div>
        }
          <div className= 'vs-label'>
            {
              this.state.content !== ''
              ? <div>
                  VS
                </div>
              : ''
            }
          </div>
          <div className= "other-side">
          {
            this.state.content !== '' ?
              <div>
                Other Hand
              </div>
            : ''
          }
          {
            this.state.role !== ''
            ? this.state.role === 'player1'
              ? this.state.player2 !== ''
                ? <label className="result-label">
                    <FontAwesomeIcon
                      icon={
                        this.state.player2 === 'paper'
                        ? faHandPaper
                        : this.state.player2 === 'rock'
                          ? faHandRock
                          : faHandScissors
                        }
                    />
                  </label>
                : this.renderLoading()
              : this.state.player1 !== ''
                ? <label className="result-label">
                    <FontAwesomeIcon
                      icon={
                        this.state.player1 === 'paper'
                        ? faHandPaper
                        : this.state.player1 === 'rock'
                          ? faHandRock
                          : faHandScissors
                      }
                    />
                  </label>
                : this.renderLoading()
            : ''
          }
          </div>
          {
            this.state.winner !==''
            ? 
            <div className='result-winner'>
              <div>
                {
                  this.state.winner === this.state.role
                  ? "You win!"
                  : this.state.winner === 'draw'
                    ? "Draw"
                    : "You Lose!"
                }
              </div>
              <button className='btn btn-dark reset-btn'
                onClick={this.handleReset}>
                <span>
                  Play Again
                </span>
              </button>
            </div>
            :""
          }
        </div>
        {
          this.state.isfinish === false
          ? <div>
              <div className="col-12 pb-2 icons-title">
                <span>
                  Choose your hand : 
                </span>
              </div>
              <div className="col-12 pb-5">
                <input className="checkbox-tools"
                  type="radio"
                  name="tools"
                  value="paper"
                  id="tool-1" 
                  onClick={this.chooseHand[0]}/>
                <label className="for-checkbox-tools" 
                  htmlFor="tool-1">
                  <FontAwesomeIcon
                    icon={faHandPaper}
                    size="2x"
                  />
                </label>
                <input className="checkbox-tools"
                  type="radio"
                  name="tools"
                  value="Rock"
                  id="tool-3"
                  onClick={this.chooseHand[1]}/>
                <label className="for-checkbox-tools"
                  htmlFor="tool-3">
                  <FontAwesomeIcon 
                    icon={faHandRock}
                    size='2x'
                  />
                </label>
                <input className="checkbox-tools"
                  type="radio"
                  name="tools"
                  value='scissors'
                  id="tool-2"
                  onClick={this.chooseHand[2]}/>
                <label className="for-checkbox-tools"
                  htmlFor="tool-2">
                  <FontAwesomeIcon 
                    icon={faHandScissors}
                    size="2x"
                  />
                </label>
              </div>
            </div>
            : this.state.winner === ''
              ? <div className='col-12 pb-2'>
                  <span>
                    Waiting other choose hand...
                  </span>
                </div>
              : ""
        }
        <div className="py-5 mx-3">
          Login in as: <strong className="text-info">{this.state.user.email}</strong>
        </div>
      </div>
    );
  }
}
