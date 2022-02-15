
const { React } = require('powercord/webpack');
const { ButtonItem } = require('powercord/components/settings');

//This section is the Page the user sees
module.exports = class settings extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isInput: false,
    }
  }

  render() {
    return(
      <div>
        <ButtonItem
          note='Holding this key and clicking on a message will delete it.'
          button={this.state.isInput ? 'Press any key...' : this.props.getSetting('qdKey', 'Backspace')}
          onClick={() => this.setState({isInput: true})}
        >
          Set Quick-Delete Key
        </ButtonItem>
      </div>
    )
  }

  handleKeyDown = (e) => {
    if(this.state.isInput)    {
      this.setState({ isInput: false })
      this.props.updateSetting('qdKey', e.code);
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
      document.removeEventListener("keydown", this.handleKeyDown);
  }
}
