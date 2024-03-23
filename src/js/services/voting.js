import { firebaseConfig } from "../config/firebase";
export class VotingService {

    constructor() {
        this.timestamp = Date.now();
        this.groupId = this.timestamp;
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.database();
        this.affirmitiveVotes = [];
        this.localStorageKey = 'affirmitive';
        this.voted = false;

    }

    createGroup() {
        const status = 'active';
        localStorage.removeItem(`done-${this.groupId}`);
        this.db.ref(`votegroup/${this.groupId}`).set({
            timestamp: this.timestamp,
            status,
            totalIn: 0
        });
        return this.groupId;
    }


    closeVote() {
        const status = 'closing';
        this.db.ref("votegroup/" + this.groupId).update({
            status,
        });
    }

    incrementTotalIn() {
        if(!localStorage.getItem(`done-${this.groupId}`)) {
            localStorage.setItem(`done-${this.groupId}`, true);
            const db_id = `votegroup/${this.groupId}`;
            this.db.ref(db_id).once("value", (snapshot) => {
                const option = snapshot.val();
                let totalIn = option.totalIn ?? 0;
                this.db.ref(db_id).update({
                    totalIn: totalIn += 1
                });
            });
        }
    }

    addOption(option) {
        const ts = Date.now();
        /*this.db.ref("votegroup/" + this.groupId).update({
            totalIn: 0,
        });*/
        this.db.ref("votegroup/" + this.groupId + "/options/" + ts).update({
            option,
            id: ts,
            votes: 0,
        });

        return {
            option,
            id: ts,
            votes: 0,
        }
    }

    checkOption(optionId) {
        let votes = JSON.parse(localStorage.getItem('affirmitive')) ?? [];
        votes.push(optionId);
        localStorage.setItem('affirmitive', JSON.stringify(votes));

        const db_id = `votegroup/${this.groupId}/options/${optionId}`;
        this.db.ref(db_id).once("value", (snapshot) => {
            const option = snapshot.val();
            this.db.ref(db_id).update({
                votes: option.votes += 1
            });
        });

        if(!this.voted) {
            this.incrementTotalIn();
            this.voted = true;
        }
    }

    uncheckOption(optionId) {
        let votes = JSON.parse(localStorage.getItem('affirmitive')) ?? [];
        votes = votes.filter(item => item !== optionId.toString());
        localStorage.setItem('affirmitive', JSON.stringify(votes));

        const db_id = `votegroup/${this.groupId}/options/${optionId}`;
        this.db.ref(db_id).once("value", (snapshot) => {
            const option = snapshot.val();
            this.db.ref(db_id).update({
                votes: option.votes -= 1
            });
        });
    }

    getGroup(groupId, callback) {
        this.groupId = groupId;
        this.db.ref(`votegroup/${groupId}`).once("value", (group) => {
            if (group) {
                const optionsFetch = this.db.ref(`votegroup/${groupId}/options`);
                optionsFetch.on("child_added", callback);
            }
        });
    }


    getVotes() {
        return JSON.parse(localStorage.getItem('affirmitive')) ?? [];
    }

    subscribeToStatusChanges(callback) {
        this.db.ref(`votegroup/${this.groupId}`).on('value', (snapshot) => {
            const group = snapshot.val();
            
            if(group && group.status && group.status == 'closing') {
                
                if(group.winner) {
                    return;
                }
                const shuffled = this._shuffle(Object.values(group.options));
                const winner = shuffled
                .reduce((prev, curr) => (prev.votes > curr.votes ? prev : curr));

                this.db.ref("votegroup/" + this.groupId).update({
                    status: 'closed',
                    winner: winner,
                });
            }
            callback(group);

        });
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