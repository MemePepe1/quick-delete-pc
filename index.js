const { Plugin } = require('powercord/entities');
const { getModule, getModuleByDisplayName, messages: { deleteMessage }, constants: { Permissions } } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { can } = getModule(["getChannelPermissions"], false);
const { getCurrentUser } = getModule(["getCurrentUser"], false);
const Settings = require("./components/settings.jsx");

const canDeleteMessage = (msg, channel) => msg.author === getCurrentUser() || can(Permissions.MANAGE_MESSAGES, channel);

module.exports = class QuickDelete extends Plugin {
    async startPlugin() {
        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: 'Message Quick-Delete',
            render: Settings,
        });

        const Message = getModule(m => m.default?.displayName === "Message", false);
        inject("quick-delete", Message, 'default', (args, res) => {
            // Reassign onClick function (botch)
            res.props.children.props.oldOnClick = res.props.children.props.onClick;
            res.props.children.props.onClick = ((e) => this.handleMessageClick(e, args, res))
            return res;
        })

        // Weird quirk
        this.handleKeyPress = this.handleKeyPress.bind(this);
        document.body.addEventListener("keydown", this.handleKeyPress);
        document.body.addEventListener("keyup", this.handleKeyPress);
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings(this.entityID);

        uninject("quick-delete")

        document.body.removeEventListener('keydown', this.handleKeyPress);
        document.body.removeEventListener('keyup', this.handleKeyPress);
    }

    handleKeyPress(e) {
        this.keyBindDown = e.code === this.settings.get('qdKey', "Backspace");
    }

    handleMessageClick(e, args, res) {
        try {
            const { childrenAccessories: { props: { message, channel } } } = args[0];

            // Call old onClick function to where it doesn't disturb the rest of the code
            if (typeof res.props.children.props.oldOnClick === 'function')
                try {
                    res.props.children.props.oldOnClick(e)
                } catch (err) {
                    this.error("An error occurred in the backed up onClick function. It is unlikely this plugin is the cause. :: " + err)
                }

            // Delete message on keybind down && left click && canDeleteMessage.
            if (this.keyBindDown && e.button === 0 && canDeleteMessage(message, channel)) {
                this.handleMessageDelete(message);
            }
        } catch (err) {
            this.error(err);
        }
    }

    handleMessageDelete(msg) {
        deleteMessage(msg.channel_id, msg.id, false);
    }
};
