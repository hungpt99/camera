import { useHistory } from "react-router-dom";
import { useQuery } from '@apollo/client'
import { getUser } from '../../../graphql/user';
import { useRef } from "react";
import moment from 'moment';
import { useState } from "react";

export default function ListCamera(props) {
    const refInput = useRef(null);
    const [dataLocation, setDataLocation] = useState([])

    const onCompleted = ({ user }) => {
        setDataLocation(user?.locations || [])
    }
    const { data } = useQuery(getUser, { onCompleted });


    let history = useHistory();
    const openLocation = (_id) => {
        history.push("/Location/" + _id);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            let array = data?.user?.locations;
            array = array?.filter(value => value?.location_name?.match(refInput.current.value));
            setDataLocation(array)
        }
    }
    const handleSearchButton = () => {
        let array = data?.user?.locations;
        array = array?.filter(value => value?.location_name?.match(refInput.current.value));
        setDataLocation(array)
    }
    const listCamera = () => {
        return dataLocation?.map((value, index) => {
            const imgPath = ` http://localhost:4008/${data?.user?._id}/map/${value._id}.jpg`;
            const numberOfCameras = data?.user?.cameras?.filter(camera => camera.location === value._id)?.length;
            return (
                <div key={index} className="custom-card">
                    <img src={imgPath} />
                    <div className="card-body">
                        <h5 className="card-title">{value.location_name}</h5>
                        <p>Số camera: {numberOfCameras}</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => openLocation(value._id)}
                        >
                            Xem
                        </button>
                    </div>
                </div>
            );
        })
    }

    return (
        <div>
            <p className='title'>Địa điểm gắn camera</p>
            <div className='search'>
                <input ref={refInput} onKeyDown={handleKeyDown} placeholder="Nhập tên địa điểm..." />
                <button className='btn btn-primary' onClick={handleSearchButton}>Search</button>
            </div>
            {listCamera()}
        </div>
    )

}
