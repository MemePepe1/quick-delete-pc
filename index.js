const { Plugin } = require('powercord/entities');
const { findInReactTree } = require("powercord/util");
const { getModule, React, messages: { deleteMessage }, constants } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { can } = getModule(["can", "canEveryone"], false);
const { getUser, getCurrentUser } = getModule(["getCurrentUser"], false);
const { getChannel } = getModule(["getChannel"], false);
const { getSelectedChannelId } = getModule(["getSelectedChannelId"], false);
const { Permissions: { MANAGE_MESSAGES } } = constants;
const canDeleteMessage = d => (d.author.id == getCurrentUser().id || can(MANAGE_MESSAGES, getCurrentUser(), getChannel(getSelectedChannelId())));
let Message;
const Activate = 8;
module.exports = class QuickDelete extends Plugin {

    async startPlugin() {
        Message = getModule(m => m?.default?.displayName === "Message", false);
        inject("quick-delete", Message, 'default', (_, res) => {
            // Reassign onClick function (botch)
            res.props.children.props.oldOnCLick = res.props.children.props.onClick;
            res.props.children.props.onClick = ((e) => {
                ((e, _this, res) => {
                    // Call old onClick function to where it doesn't disturb the rest of the code
                    (async () => { res.props.children.props.oldOnCLick(e)})()
                    // Get `Message` Object
                    let d = findInReactTree(res, r => r?.message).message;
                    // Delete message on keybind down && left click && canDeleteMessage.
                    if (_this.keybindDown && e.button == 0 && canDeleteMessage(d)) {
                        _this.deleteMessage(findInReactTree(res, r => r?.message).message);
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
