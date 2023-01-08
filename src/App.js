import { useState } from "react";
import axios from "axios";

import { NFTStorage } from "nft.storage";

function App() {
	const [prompt, setPrompt] = useState("");
	const [imageBlob, setImageBlob] = useState(null);
	const [file, setFile] = useState(null);

	console.log(prompt);

  const cleanupIPFS = (url) => {
    if(url.includes("ipfs://")) {
      return url.replace("ipfs://", "https://ipfs.io/ipfs/")
    }
  }

	const generateArt = async () => {
		try {
			const response = await axios.post(
				`https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5`,
				{
					headers: {
						Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE}}`,
					},
					method: "POST",
					inputs: prompt,
				},
				{ responseType: "blob" }
			);
			// convert blob to a image file type
			const file = new File([response.data], "image.png", {
				type: "image/png",
			});
			console.log(file);
			setFile(file);
			console.log(response);
			const url = URL.createObjectURL(response.data);
			// console.log(url)
			console.log(url);
			setImageBlob(url);
		} catch (err) {
			console.log(err);
		}
	};

  const uploadArtToIpfs = async () => {
    try {

      const nftstorage = new NFTStorage({
				token: process.env.REACT_APP_NFT_STORAGE,
			})

      const store = await nftstorage.store({
        name: file.name,
        description: "AI generated NFT",
        image: file
      })

      console.log(store)

    } catch(err) {
      console.log(err)
    }
  }

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-4">
			<h1 className="text-4xl font-extrabold">AI Art Gasless mints</h1>
			<div className="flex flex-col items-center justify-center">
				{/* Create an input box and button saying next beside it */}
				<div className="flex items-center justify-center gap-4">
					<input
						className="border-2 border-black rounded-md p-2"
						onChange={(e) => setPrompt(e.target.value)}
						type="text"
						placeholder="Enter a prompt"
					/>
					<button
						onClick={generateArt}
						className="bg-black text-white rounded-md p-2"
					>
						Next
					</button>
				</div>
				{imageBlob && (
					<div className="flex flex-col gap-4 items-center justify-center">
						<img src={imageBlob} alt="AI generated art" />
						<button
							onClick={uploadArtToIpfs}
							className="bg-black text-white rounded-md p-2"
						>
							Mint NFT
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
