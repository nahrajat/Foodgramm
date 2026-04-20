import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/reelfeed.css'
import ReelFeed from '../../components/ReelFeed'

const Homepage = () => {
    const navigate = useNavigate()
    const [ videos, setVideos ] = useState([])
    const [ isFoodPartner, setIsFoodPartner ] = useState(false)
    // Autoplay behavior is handled inside ReelFeed

    useEffect(() => {
        axios.get("/api/food", { withCredentials: true })
            .then(response => {

                console.log(response.data);

                setVideos(response.data.foodItems)
            })
            .catch(() => { /* noop: optionally handle error */ })

        axios.get('/api/food-partner/me', { withCredentials: true })
            .then(() => setIsFoodPartner(true))
            .catch(() => setIsFoodPartner(false))
    }, [])

    // Using local refs within ReelFeed; keeping map here for dependency parity if needed

    async function likeVideo(item) {

    const response = await axios.post("/api/food/like", { foodId: item._id }, {withCredentials: true})

        if(response.data.like){
            console.log("Video liked");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v))
        }else{
            console.log("Video unliked");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v))
        }
        
    }

    async function saveVideo(item) {
    const response = await axios.post("/api/food/save", { foodId: item._id }, { withCredentials: true })
        
        if(response.data.save){
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v))
        }else{
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount - 1 } : v))
        }
    }

    return (
        <>
            {isFoodPartner && (
                <button
                    type="button"
                    className="reels-create-btn"
                    onClick={() => navigate('/create-food')}
                >
                    Create Post
                </button>
            )}

            <ReelFeed
                items={videos}
                onLike={likeVideo}
                onSave={saveVideo}
                emptyMessage="No videos available."
            />
        </>
    )
}

export default Homepage