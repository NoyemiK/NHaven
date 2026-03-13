export default {

    // ---------
    // |
    // | Channel switching triggered by keyboard combos
    // |
    // ---------

    //TODO(Yemita): Figure out why it doesn't clear the unread flag on these channels
    _nextUnread(num)
    {
        let parent_channels = this.channels.filter(c => !c.is_dm && !c.parent_channel_id);
        let subchannels = this.channels.filter(c => !c.is_dm && c.parent_channel_id);
        let dm_channels = this.channels.filter(c => c.is_dm > 0);
        subchannels = subchannels.sort((a,b) => a.position - b.position);
        subchannels = subchannels.sort((a,b) => a.parent_channel_id - b.parent_channel_id);
        let channel_list = [];
        for (const elem in parent_channels) {
            channel_list.push(parent_channels[elem]);
            for (let idx = 0; idx < subchannels.length; ++idx) {
                if (subchannels[idx].parent_channel_id === parent_channels[elem].id) { channel_list.push(subchannels[idx]); }
            }
        }
        channel_list = channel_list.concat(dm_channels);
        channel_list = channel_list.filter(c => c.code === this.currentChannel || c.unreadCount > 1);
        let current_channel = channel_list.findIndex(c => c.code === this.currentChannel);
        if (channel_list.length <= 1) { return; }

        let next_channel = current_channel + num;
        if (next_channel < 0 || current_channel === -1) {
            next_channel = channel_list.length - 1;
        }
        if (next_channel >= channel_list.length) {
            next_channel = 0;
        }
        this.switchChannel(channel_list[next_channel].code);
    },

    _nextChannel(num)
    {
        let parent_channels = this.channels.filter(c => !c.is_dm && !c.parent_channel_id);
        let subchannels = this.channels.filter(c => !c.is_dm && c.parent_channel_id);
        subchannels = subchannels.sort((a,b) => a.position - b.position);
        subchannels = subchannels.sort((a,b) => a.parent_channel_id - b.parent_channel_id);
        let channel_list = [];
        for (const elem in parent_channels) {
            channel_list.push(parent_channels[elem]);
            for (let idx = 0; idx < subchannels.length; ++idx) {
                if (subchannels[idx].parent_channel_id === parent_channels[elem].id) { channel_list.push(subchannels[idx]); }
            }
        }
        let current_channel = channel_list.findIndex(c => c.code === this.currentChannel);
        let next_channel = current_channel + num;
        if (next_channel < 0 || current_channel === -1) {
            next_channel = channel_list.length - 1;
        }
        if (next_channel >= channel_list.length) {
            next_channel = 0;
        }
        this.switchChannel(channel_list[next_channel].code);
    }

}
