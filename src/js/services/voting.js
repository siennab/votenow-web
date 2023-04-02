import { firebaseConfig } from "../config/firebase";
export class VotingService {

    constructor() {
        this.timestamp = Date.now();
        this.groupId = this.timestamp;
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.database();
        this.affirmitiveVotes = [];
    }

    createGroup() {
        const status = 'active';
        this.db.ref("votegroup/" + this.groupId).set({
            timestamp: this.timestamp,
            status,
        });

        return this.groupId;
    }


    closeVote() {
        const status = 'closed';
        this.db.ref("votegroup/" + this.groupId).update({
            status,
        });
    }

    addOption(option) {
        const ts = Date.now();
        this.db.ref("votegroup/" + this.groupId + "/options/" + ts).set({
            option,
            id: ts,
            votes: 0,
        });
    }

    checkOption(optionId) {
        this.affirmitiveVotes.push(optionId);
        const db_id = `votegroup/${this.groupId}/options/${optionId}`;
        this.db.ref(db_id).once("value", (snapshot) => {
            const option = snapshot.val();
            this.db.ref(db_id).update({
                votes: option.votes += 1
            });
        });
    }

    uncheckOption(optionId) {
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
        return this.affirmitiveVotes;
    }

    subscribeToStatusChanges(callback) {
        this.db.ref(`votegroup/${this.groupId}`).on('value', (snapshot) => {
            const group = snapshot.val();
            if(group && group.status && group.status == 'closed') {
                callback(group);
            }
            
        });
    }
}