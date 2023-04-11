import { VotingService } from './services/voting';
import '../css/main.scss';
export class VoteNow {

  constructor() {
    this.votingService = new VotingService();
    this.step1 = document.querySelector('[data-step-1]');
    this.step2 = document.querySelector('[data-step-2]');
    this.step3 = document.querySelector('[data-step-3]');

    this.createGroupButton = document.getElementById('create-group-button');
    this.addOptionForm = document.getElementById('add-option');
    this.closeGroupButton = document.getElementById('close-group-button');
    this.optionsContainer = document.getElementById('options');
    this.shareButton = document.getElementById('share-button');
    this.doneAction = document.getElementById('done-action');
    this.addedAction = document.getElementById('added-action');
    this.totalIn = document.getElementById('total-in');

    this.doneVoting = false;

    this.overlay = document.getElementById('overlay');

    this.options = [];
    this.init();
  }

  init() {
    this.bindButtons()
    this.onWindowLoad()
  }

  bindButtons() {
    this.createGroupButton.addEventListener('click', (e) => {
      const id = this.votingService.createGroup();
      window.location = `${window.location}?groupId=${id}`;
    });

    this.addOptionForm.onsubmit = ((e) => {
      e.preventDefault();
      const input = document.getElementById('option');
      this.votingService.addOption(input.value);
      input.value = '';
      this.addedAction.classList.remove('hidden');
      this.doneAction.classList.add('hidden');

    });

    this.closeGroupButton.addEventListener('click', (e) => {
      this.votingService.closeVote();
    });

    this.shareButton.addEventListener('click', (e) => {
      this.share();
    });

    const self = this;
    this.doneAction.addEventListener('click', (e) => {
      self.doneAction.classList.add('hidden');
      self.votingService.incrementTotalIn();
      document.getElementById('done-message').classList.remove('hidden');
    });

    this.addedAction.querySelector('a').addEventListener('click', (e) => {
      this.shareAdded();
    });


  }

  onWindowLoad() {
    window.addEventListener('load', (e) => {
      const urlParams = new URLSearchParams(window.location.search);
      let groupId = urlParams.get('groupId');

      if (groupId) {

        this.step2.classList.remove('hidden');
        this.step1.classList.add('hidden');

        this.votingService.getGroup(groupId, (snapshot) => {
          const options = snapshot.val();

          this.options.push(options);
          const option = this.buildOption(options);
          this.optionsContainer.appendChild(option);
        });
        this.votingService.subscribeToStatusChanges((group) => {
          const hasVotes = Object.values(group?.options ?? []).some(option => option.votes > 0);
          this.totalIn.innerText = group?.totalIn;
          
          if(hasVotes) {
            this.closeGroupButton.removeAttribute('disabled');
          } else {
            this.closeGroupButton.setAttribute('disabled', true);
          }

          if(group && group.status && group.status == 'closed') {
            this.onVoteClose(group)
          }

        });
      }
    });
    setTimeout(() => {
      this.overlay.classList.add('hide');
    }, 1000);
  }

  buildOption(options) {
    const votes = this.votingService.getVotes();
    const optionInput = document.createElement('input');
    optionInput.type = 'checkbox';
    optionInput.checked = votes.includes(options.id.toString());
    optionInput.id = options.id;
    optionInput.classList.add('hide');
    optionInput.onchange = (e) => { this.handleVote(e) };

    const label = document.createElement('label');
    label.append(options.option);

    const div = document.createElement('div');
    div.appendChild(optionInput);
    div.appendChild(label);

    return div;
  }

  handleVote(event) {
    const checked = event.target.checked;
    const optionId = event.target.id;

    if (checked) {
      this.addedAction.classList.add('hidden');
      this.doneAction.classList.remove('hidden');
      this.votingService.checkOption(optionId);
    } else {
      this.votingService.uncheckOption(optionId);
    }
  }

  onVoteClose(group) {
    this.step2.classList.add('hidden');
    this.step3.classList.remove('hidden');

    // to do: tie break with random number generation 
    // sucks to know the last tie will always win
    const shuffled = this._shuffle(Object.values(group.options));
    const winner = shuffled
      .reduce((prev, curr) => (prev.votes > curr.votes ? prev : curr));

    const h2 = document.createElement('h2');
    h2.classList.add('slide-up');
    h2.innerText = winner.option;

    document.getElementById('result').appendChild(h2);
  }

  share() {
    if (navigator.share) {
      navigator.share({
        title: 'Add your vote!',
        url: window.location.href
      }).then(() => {
        console.log('Thanks for sharing!');
      })
        .catch(console.error);
    } else {
      // fallback
    }
  }

  shareAdded() {
    if (navigator.share) {
      navigator.share({
        title: 'New Options',
        text: 'I added options to our Voty!',
        url: window.location.href
      }).then(() => {
        console.log('Thanks for sharing!');
      })
        .catch(console.error);
    } else {
      // fallback
    }
  }

  // Function to shuffle an array using Fisher-Yates algorithm
  _shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

}

window.voteNow = new VoteNow();




