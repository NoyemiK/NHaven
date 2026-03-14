export default {

    // ---------
    // |
    // | Channel switching triggered by keyboard combos
    // |
    // ---------

    _nextUnread(num)
    {
        Object.keys(this.unreadCounts).forEach(key => {
            let cc = this.channels.findIndex(c => c.code === key);
            this.channels[cc].unreadCount = this.unreadCounts[key];
        });
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
        channel_list = channel_list.filter(c => c.code === this.currentChannel || c.unreadCount >= 1);
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
        Object.keys(this.unreadCounts).forEach(key => {
            let cc = this.channels.findIndex(c => c.code === key);
            this.channels[cc].unreadCount = this.unreadCounts[key];
        });
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
    },

    _openQuickSwitcher() {
        document.getElementById('quick-switcher-overlay')?.remove();

        let overlay = document.createElement('div');
        overlay.id = 'quick-switcher-overlay';
        overlay.innerHTML = `
            <div class="quick-switcher-box">
                <input type="text" id="quick-switcher-input" placeholder="Goto channel ..." autocomplete="off" spellcheck="false">
                <div id="quick-switcher-results"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = overlay.querySelector('#quick-switcher-input');
        let results = overlay.querySelector('#quick-switcher-results');
        let selection_idx = 0;

        let channel_list = (this.channels || []).map(c => ({
            code: c.code,
            name: c.is_dm && c.dm_target
            ? `@ ${this._getNickname(c.dm_target.id, c.dm_target.username)}`
            : `# ${c.name}`,
            is_dm: c.is_dm,
            unread: this.unreadCounts[c.code] || 0,
        }));

        const render = (query) => {
            const q = query.toLowerCase();
            const filtered = q
                ? channel_list.filter(c => c.name.toLowerCase().includes(q))
                : channel_list.filter(c => c.unread > 0).concat(
                    channel_list.filter(c => c.unread === 0)
            );

            const shown = filtered.slice(0, 12);
            selection_idx = Math.min(selection_idx, Math.max(0, shown.length - 1));
            results.innerHTML = shown.map((c, i) => `
                <div class="quick-switcher-item${i === selection_idx ? ' selected' : ''}" data-code="${this._escapeHtml(c.code)}">
                    <span class="qs-name">${this._escapeHtml(c.name)}</span>
                    ${c.unread > 0 ? `<span class="qs-badge">${c.unread > 99 ? '99+' : c.unread}</span>` : ''}
                </div>
            `).join('');
            results.querySelectorAll('.quick-switcher-item').forEach(e => {
                e.addEventListener('click', () => {
                    this.switchChannel(e.dataset.code);
                    overlay.remove();
                });
            });
        };

        input.addEventListener('input', () => {
            selection_idx = 0;
            render(input.value);
        });
        input.addEventListener('keydown', (e) => {
            const items = results.querySelectorAll('.quick-switcher-item');
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const dir = (e.key === 'ArrowDown' ? 1 : -1);
                if (dir === 1) { selection_idx = Math.min(selection_idx + dir, items.length - 1) }
                else if (dir === -1) { selection_idx = Math.max(selection_idx + dir, 0) }
                render(input.value);
            }
            else if (e.key === 'Enter'){
                e.preventDefault();
                const selection = items[selection_idx];
                if (selection) {
                    this.switchChannel(selection.dataset.code);
                    overlay.remove();
                }
            }
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        render('');
        setTimeout(() => input.focus(), 10);
    }
}
