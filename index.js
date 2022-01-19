const { Plugin } = require('powercord/entities');
const { getModule, React, messages: { deleteMessage }, constants } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { can } = getModule(["getChannelPermissions"], false);
const { getUser, getCurrentUser } = getModule(["getCurrentUser"], false);
const { Permissions: { MANAGE_MESSAGES } } = constants;
const canDeleteMessage = (msg, channel) => (msg.author === getCurrentUser() || can(MANAGE_MESSAGES, channel));
let Message;
const Activate = 8;
module.exports = class QuickDelete extends Plugin {

    async startPlugin() {
        Message = getModule(m => m?.default?.displayName === "Message", false);
        inject("quick-delete", Message, 'default', (args, res) => {
            // Reassign onClick function (botch)
            res.props.children.props.oldOnCLick = res.props.children.props.onClick;
            res.props.children.props.onClick = ((e) => {
                const { childrenAccessories: { props: { message, channel } } } = args[0];
                ((e, _this, res) => {
                    // Call old onClick function to where it doesn't disturb the rest of the code
                    if (typeof res.props.children.props.oldOnCLick === 'function')
                        (async () => { res.props.children.props.oldOnCLick(e) })()
                    // Delete message on keybind down && left click && canDeleteMessage.
                    if (_this.keybindDown && e.button == 0 && canDeleteMessage(message, channel)) {
                        _this.deleteMessage(message);
                    }
                })(e, this, res)
            })
            return res;
        })
        document.body.addEventListener("keydown", (e) => { if (e.keyCode == Activate) { this.keybindDown = true; } })
        document.body.addEventListener("keyup", (e) => { if (e.keyCode == Activate) { this.keybindDown = false; } })
        document.body.addEventListener("mousedown", (e) => { if (e.button == 0) { this.mouseDown = true; } })
        document.body.addEventListener("mouseup", (e) => { if (e.button == 0) { this.mouseDown = false; } })

    }
    deleteMessage(mesg) {
        deleteMessage(mesg.channel_id, mesg.id)
    }

    pluginWillUnload() {
        uninject("quick-delete")
    }
};
