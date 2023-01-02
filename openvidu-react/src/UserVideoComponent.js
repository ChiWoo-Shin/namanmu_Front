// import React, { Component } from 'react';
// import OpenViduVideoComponent from './OvVideo';
// import './UserVideo.css';

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

import React from 'react';
import OpenViduVideoComponent from './OvVideo';
import './UserVideo.css';
import S_words from './page_info/S_word';

const UserVideoComponent = ({ streamManager }) => {
  const getNicknameTag = () => {
    // Gets the nickName of the user
    return JSON.parse(streamManager.stream.connection.data).clientData;
  }

  return (
    <div>
      <div>TEST2222</div>
      {streamManager !== undefined ? (
        <>
        <div className="streamcomponent">
          <OpenViduVideoComponent streamManager={streamManager} />
          <div><p>{getNicknameTag()}</p></div>
          {getNicknameTag()==1 ? console.log(true) : console.log(false)}
          {/* <div><p>제시어를 여기로 출력하면?</p></div> */}
        </div>
        </>
      ) : null}
        <div>
            여기는 어떻게 출력되는가?
        </div>
    </div>
  );
};

export default UserVideoComponent;