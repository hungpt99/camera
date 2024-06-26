import React, { useState, useEffect, useRef } from "react";
import Dropzone from 'react-dropzone'
import { useParams } from "react-router-dom";
import "./css/index.scss";
import * as faceapi from "face-api.js";
import { useQuery, useLazyQuery } from '@apollo/client';
import { getVideo } from '../../graphql/video';
import { getReports } from '../../graphql/report';
import { getUser } from '../../graphql/user';
import moment from 'moment';

export default function Video(props) {
    const isMounted = useRef(true);

    const { id } = useParams();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [timeVideo, setTimeVideo] = useState(false);
    const [environment, setEnvironment] = useState(false);
    const [file, setFile] = useState(null);
    const alert = useRef(null);
    const [start, setStart] = useState(null)
    const [end, setEnd] = useState(null);

    const onCompleted = ({ video }) => {
        setStart(new Date(video?.createdAt).getTime());
    }
    const { data: videos } = useQuery(getVideo, {
        variables: {
            _id: id,
        },
        skip: id === null,
        onCompleted
    });
    const { data: user } = useQuery(getUser);
    const [fetchReports, { data: reports }] = useLazyQuery(getReports);

    const video_path = `${process.env.REACT_APP_DOMAIN}\\video\\${user?.user?._id}\\${videos?.video?.camera?._id}\\${videos?.video?.video_time}`;
    console.log(video_path)
    useEffect(() => {
        loadModels()
        return () => { isMounted.current = false; };
    }, [])
    useEffect(() => {
        if (end) fetchReports({ variables: { start, end } });
    }, [end])
    useEffect(() => {
        if (start) checkLoadComplete();
    }, [start])

    const handleOnDrop = (file) => {
        if (!file?.length) return;
        canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        alert.current.className = 'alert alert-danger text-center d-none';
        const reader = new FileReader();

        reader.readAsDataURL(file[0]);
        reader.onload = () => setFile(reader.result);
    }
    const checkLoadComplete = () => {
        const video = videoRef.current;
        video.addEventListener('loadeddata', async () => {
            const videoTime = Math.round(video.duration);
            setTimeVideo(videoTime);
            setEnd(new Date(start).getTime() + videoTime * 1000);
        })
    }

    const loadModels = async () => {
        const path = '/models';
        if (!faceapi.nets.ssdMobilenetv1.isLoaded || !faceapi.nets.faceLandmark68Net.isLoaded || !faceapi.nets.faceRecognitionNet.isLoaded)
            await Promise.all([
                faceapi.nets.faceRecognitionNet.loadFromUri(path),
                faceapi.nets.ssdMobilenetv1.loadFromUri(path),
                faceapi.nets.faceLandmark68Net.loadFromUri(path),
            ])
        setEnvironment(true);
    }
    const getFaceDescription = async () => {
        const img = new Image();
        img.src = file;
        return await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
    }

    const seekVideoAndDetectFace = async () => {
        canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        if (!file) return;
        const descriptions = await getFaceDescription();
        if (!descriptions) return alert.current.className = 'alert alert-danger text-center';
        alert.current.className = 'alert alert-danger text-center d-none';
        const video = videoRef.current;
        let seekResolve;
        video.addEventListener('seeked', async function () {
            if (seekResolve) seekResolve();
        });
        let currentTime = video.currentTime;
        while (currentTime < timeVideo) {
            video.currentTime = currentTime;
            await new Promise(r => seekResolve = r);// doi seek xong
            const data = await detectFace(descriptions);
            if (data) return drawDetections(data);
            currentTime += 1
        }
        alert.current.className = 'alert alert-danger text-center';
    }
    const detectFace = async (descriptions) => {
        if (!descriptions?.descriptor) return false;
        let video = videoRef.current;
        const resultDetect = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptors();
        if (!resultDetect?.length) return false;
        const faceMatcher = new faceapi.FaceMatcher(resultDetect);
        if (faceMatcher.findBestMatch(descriptions?.descriptor).label !== 'unknown') return resultDetect;
        return false;
    }
    const drawDetections = (data) => {
        if (!isMounted.current || !data || !canvasRef.current?.getContext('2d')) return;
        const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
        }
        faceapi.matchDimensions(canvasRef.current, displaySize)
        const resizedDetections = faceapi.resizeResults(data, displaySize);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
    }
    const handleButtonSeek = (time) => {
        const video = videoRef.current;
        video.currentTime = time;
    }
    const progressbar = () => {
        if (!videos?.video?.createdAt) return;

        return (
            <ul className="progressbar">
                <li style={{ left: 0 }} onClick={() => handleButtonSeek(0)}></li>
                <p style={{ left: 0 }}>{moment(start).format('DD/MM/YYYY')}</p>
                <li style={{ right: 0 }} onClick={() => handleButtonSeek(end - start)}></li>
                <p style={{ right: 0 }}>{moment(end).format('DD/MM/YYYY')}</p>
            </ul >
        )
    }


    return (
        <div id="VideoDetail">
            <div className="left-pane">
                <div className='video-pane'>
                    {videos ? <video ref={videoRef} src={video_path} id='video' controls crossOrigin="anonymous" /> : ''}
                    <canvas ref={canvasRef} className='result-canvas' />
                </div>
                {progressbar()}
            </div>
            <div className="right-pane">
                <p className='title'>Xem lại</p>
                <p className='small-title'>Tên camera</p>
                <p className='small-text'>{videos?.video?.camera?.camera_name}</p>
                <p className='small-title'>Thời gian</p>
                <p className='small-text'>{moment(start).format('DD/MM/YYYY HH:mm')}</p>
                <Dropzone multiple={false} onDrop={handleOnDrop} accept='image/jpeg, image/png'>
                    {({ getRootProps, getInputProps }) => (
                        <section className='dropzone'>
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                {file ? <img className='thumb' src={file} /> : <p>Drag 'n' drop some files here, or click to select files</p>}
                            </div>
                        </section>
                    )}
                </Dropzone>
                <p ref={alert} className='alert alert-danger text-center d-none'>Không tìm thấy</p>
                <button disabled={!environment && !timeVideo} onClick={seekVideoAndDetectFace}>Tìm kiếm</button>
            </div>
        </div>
    );
}
