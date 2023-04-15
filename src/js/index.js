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
    this.shareButtonResults = document.getElementById('share-button-results');

    this.doneAction = document.getElementById('done-action');
    this.doneMessage = document.getElementById('done-message');
    this.addedAction = document.getElementById('added-action');
    this.totalIn = document.getElementById('total-in');

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
    });

    this.closeGroupButton.addEventListener('click', (e) => {
      this.votingService.closeVote();
    });

    this.shareButton.addEventListener('click', (e) => {
      this.share();
    });

    this.shareButtonResults.addEventListener('click', (e) => {
      this.share("The winner is...");
    });

    this.addedAction.querySelector('a').addEventListener('click', (e) => {
      this.share('I added options to our voty!');
    });

    this.doneAction.addEventListener('click', (e) => {
      this.doneAction.classList.add('hidden');
      this.votingService.incrementTotalIn();
      this.doneMessage.classList.remove('hidden');
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
      this.doneAction.classList.remove('hidden');
      this.doneMessage.classList.add('hidden');
      this.votingService.checkOption(optionId);
    } else {
      this.votingService.uncheckOption(optionId);
    }
  }

  onVoteClose(group) {
    this.step2.classList.add('hidden');
    this.step3.classList.remove('hidden');

    const winner = group.winner;
    const h2 = document.createElement('h2');
    h2.classList.add('slide-up');
    h2.innerText = winner.option;

    document.getElementById('result-accent').appendChild(h2);
  }

  share(message = 'Give your input!') {
    if (navigator.share) {
      navigator.share({
        title: 'Voty',
        text: message,
        url: window.location.href
      }).then(() => {
        console.log('Thanks for sharing!');
      })
      .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('The link to this Voty has been copied to your clipboard. To share what you\'re seeing, simply paste it to your group.')
      });
    }
  }
}

window.voteNow = new VoteNow();




