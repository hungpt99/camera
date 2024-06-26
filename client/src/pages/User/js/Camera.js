import { useHistory } from "react-router";
import SettingModal from "./CameraModal";
import { useState, useEffect } from "react";
import { getUser } from '../../../graphql/user';
import { useQuery } from '@apollo/client'
import { useRef } from "react";
import Hls from 'hls.js';
import imgNotFound from '../css/broken.jpg'

export default function ListCamera(props) {
    const history = useHistory();
    const refVideo = useRef([]);

    const [location, setLocation] = useState(null);
    //modal
    const [camera, setCamera] = useState(null);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const loadVideo = () => {
        if (!camera?.length) return;
        camera?.map((value, index) => {
            if (value?.location !== location) return;
            let videoSrc = `${process.env.REACT_APP_DOMAIN}\\${value.user}\\${value._id}\\stream\\index.m3u8`;
            const hls = new Hls();
            hls.loadSource(videoSrc);
            hls.attachMedia(refVideo.current[index]);
        })
    }

    const onCompleted = ({ user }) => {
        if (!user?.locations?.length) return;
        setLocation(user?.locations[0]?._id)
        setCamera(user?.cameras);
    }
    useEffect(() => {
        loadVideo();
    }, [location])
    useEffect(() => {
        if (!location && data?.user?.locations?.length) setLocation(data?.user?.locations[0]?._id);
    }, [])

    const { loading, error, data } = useQuery(getUser, { onCompleted });

    const handleWatchButton = (id) => {
        history.push("/Camera/" + id);
    };
    const handleSettingButton = (camera) => {
        setCamera(camera);
        handleShow();
    }
    const handleCustomButton = (camera) => {
        history.push('/CameraSetting/' + camera._id)
    }
    //
    const handleDropdown = (e) => {
        setLocation(e.target.value);
    }
    const dropdown = () => {
        const listOption = data?.user?.locations?.map((value, index) => {
            return <option key={index} value={value._id}>Camera ở {value.location_name}</option>
        })
        return (
            <select onChange={handleDropdown}>
                {listOption}
            </select>
        );
    }
    const listCamera = () => {
        return data?.user?.cameras?.map((value, index) => {
            if (value?.location !== location) return;
            return (
                <div key={index} className='custom-card'>
                    <video ref={el => refVideo.current[index] = el} poster={imgNotFound} autoPlay muted></video>
                    <p className='title'>Camera {value.camera_name}</p>
                    <div className='group-button'>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleWatchButton(value._id)}
                        >
                            Xem
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSettingButton(value)}
                            style={{ marginLeft: "5%" }}
                        >
                            Cài đặt
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleCustomButton(value)}
                            style={{ marginLeft: "5%" }}
                        >
                            Chi tiet
                        </button>
                    </div>

                </div>
            )
        })
    }
    return (
        <div>
            <SettingModal show={show} handleClose={handleClose} camera={camera} />
            <p className='title'>Camera của bạn</p>
            {dropdown()}
            <div className='grid grid-2'>
                {listCamera()}
            </div>
        </div>
    )
}
