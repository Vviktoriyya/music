const Footer = () => {
    return (
        <footer className="mx-auto max-w-[1450px] w-full items-center flex flex-col lg:flex-row gap-10 lg:gap-[35px] justify-between px-5 md:px-10 lg:px-20 bg-[#181818] pt-10 lg:pt-[50px] pb-10 lg:pb-[35px] border-t-4 border-black mt-10 lg:mt-[50px]"
                style={{ boxShadow: '0 -10px 20px rgba(0,0,0,0.8)' }}>

            <div className="flex flex-col justify-center lg:w-[350px]">
                <h1 className="text-white font-[Vazirmatn] text-[20px] md:text-[26px] font-black leading-[100%] tracking-[1%] mb-3">
                    About
                </h1>
                <p className="text-white text-[14px] md:text-[16px] text-justify opacity-90">
                    Melodies is a website that has been created for over <span className="text-pink-500">5 year’s</span> now and it is one of the most famous music player website’s in the world. You can listen and download songs for free. Also, if you want no limitation you can buy our <span className="text-blue-500">premium pass</span>.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-10 lg:gap-[22px] mt-10 lg:mt-0">
                <div className="flex flex-col items-center sm:items-start">
                    <p className="text-white font-[Vazirmatn] text-[20px] md:text-[24px] font-bold mb-2">Melodies</p>
                    <p className="border-b-[3px] border-white w-[120px] mb-4"></p>
                    <div className="flex flex-col gap-2 md:gap-[20px] text-center sm:text-left">
                        <p className="text-white text-[14px] md:text-[16px]">Song</p>
                        <p className="text-white text-[14px] md:text-[16px]">Radio</p>
                        <p className="text-white text-[14px] md:text-[16px]">Podcast</p>
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-start">
                    <p className="text-white font-[Vazirmatn] text-[20px] md:text-[24px] font-bold mb-2">Access</p>
                    <p className="border-b-[3px] border-white w-[120px] mb-4"></p>
                    <div className="flex flex-col gap-2 md:gap-[20px] text-center sm:text-left">
                        <p className="text-white text-[14px] md:text-[16px]">Song</p>
                        <p className="text-white text-[14px] md:text-[16px]">Radio</p>
                        <p className="text-white text-[14px] md:text-[16px]">Podcast</p>
                        <p className="text-white text-[14px] md:text-[16px]">Albums</p>
                        <p className="text-white text-[14px] md:text-[16px]">Trending</p>
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-start">
                    <p className="text-white font-[Vazirmatn] text-[20px] md:text-[24px] font-bold mb-2">Contact</p>
                    <p className="border-b-[3px] border-white w-[120px] mb-4"></p>
                    <div className="flex flex-col gap-2 md:gap-[20px] text-center sm:text-left">
                        <p className="text-white text-[14px] md:text-[16px]">About</p>
                        <p className="text-white text-[14px] md:text-[16px]">Policy</p>
                        <p className="text-white text-[14px] md:text-[16px]">Social Media</p>
                        <p className="text-white text-[14px] md:text-[16px]">Support</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center mt-10 lg:mt-0 gap-5">
                <h1 className="text-[32px] md:text-[40px] font-extrabold w-[140px] md:w-[174px] text-left bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-vazirmatn">
                    Melodies
                </h1>
                <div className="flex gap-5 md:gap-[37px]">
                    <img src="/assets/icon/logoFacebook.png" className="w-6 h-6" alt="facebook"/>
                    <img src="/assets/icon/logoInstagram.png" className="w-6 h-6" alt="instagram"/>
                    <img src="/assets/icon/logoTwitter.png" className="w-6 h-6" alt="twitter"/>
                    <img src="/assets/icon/logoPhone.png" className="w-6 h-6" alt="phone"/>
                </div>
            </div>
        </footer>
    );
};

export default Footer;