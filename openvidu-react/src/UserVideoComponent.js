import React, { Component } from 'react';
import OpenViduVideoComponent from './OvVideo';
import './UserVideo.css';

// export default class UserVideoComponent extends Component {

//     getNicknameTag() {
//         // Gets the nickName of the user
//         return JSON.parse(this.props.streamManager.stream.connection.data).clientData;
//     }

//     render() {
//         return (
//             <div>
//                 <div>TEST2222</div>
//                 {this.props.streamManager !== undefined ? (
//                     <div className="streamcomponent">
//                         <OpenViduVideoComponent streamManager={this.props.streamManager} />
//                         {/* <div><p>{this.getNicknameTag()}</p></div> */}
//                     </div>
//                 ) : null}
//             </div>
//         );
//     }
// }

// import React from 'react';
// import OpenViduVideoComponent from './OvVideo';
// import './UserVideo.css';
// import S_words from './page_info/S_word';

const UserVideoComponent = ({ streamManager }) => {
  const getNicknameTag = () => {
    // Gets the nickName of the user
    return JSON.parse(streamManager.stream.connection.data).clientData;
  }

  return (
    <div>
        {streamManager !== undefined ? (
        <div>
          <OpenViduVideoComponent streamManager={streamManager} />
          <div>{getNicknameTag()}</div>
        </div>
      ) : null}
    </div>
  );
};

export default UserVideoComponent;