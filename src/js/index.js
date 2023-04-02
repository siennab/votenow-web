import { VotingService } from './services/voting';
import '../css/main.scss';
export class VoteNow {

  constructor() {
    this.votingService = new VotingService();

    this.createGroupButton = document.getElementById('create-group-button');
    this.addOptionForm = document.getElementById('add-option');
    this.closeGroupButton = document.getElementById('close-group-button');
    this.optionsContainer = document.getElementById('options');
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
    });

    this.closeGroupButton.addEventListener('click', (e) => {
      this.votingService.closeVote();
    });

  }

  onWindowLoad() {
    window.addEventListener('load', (e) => {
      const urlParams = new URLSearchParams(window.location.search);
      let groupId = urlParams.get('groupId');

      if (groupId) {

        this.addOptionForm.classList.remove('hidden');
        this.createGroupButton.classList.add('hidden');

        this.votingService.getGroup(groupId, (snapshot) => {
          const options = snapshot.val();
          const option = this.buildOption(options);
          this.optionsContainer.appendChild(option);

          setTimeout(() =>{
            this.closeGroupButton.classList.remove('hidden');

          }, 30000)
        });
        this.votingService.subscribeToStatusChanges((group) => {
          this.onVoteClose(group)
        });
      }
    })
  }

  buildOption(options) {
    const votes = this.votingService.getVotes();
    const optionInput = document.createElement('input');
    optionInput.type = 'checkbox';
    optionInput.checked = votes.includes(options.id);
    optionInput.id = options.id;
    optionInput.onchange = (e) => { this.handleVote(e) };

    const label = document.createElement('label');
    label.appendChild(optionInput);
    label.append(options.option);

    return label;
  }

  handleVote(event) {
    const checked = event.target.checked;
    const optionId = event.target.id;

    if (checked) {
      this.votingService.checkOption(optionId);
    } else {
      this.votingService.uncheckOption(optionId);
    }
  }

  onVoteClose(group) {
    this.optionsContainer.classList.add('hidden');
    this.createGroupButton.classList.add('hidden');
    this.addOptionForm.classList.add('hidden');
    this.closeGroupButton.classList.add('hidden');

    const winner = Object.values(group.options)
    .reduce((prev, curr) => (prev.votes > curr.votes ? prev : curr));

    document.getElementById('result').append(`The winner is ${winner.option}`);
  }
}

window.voteNow = new VoteNow();




