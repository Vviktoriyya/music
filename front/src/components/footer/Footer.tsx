
const Footer = () => {
    return (
        <div className={'flex gap-[35px] w-full px-[20px]'}>
            <div className={'flex flex-col'}>
                <p>About</p>
                <p>
                    Melodies is a website that has been created for over 5 year’s now and it is one of the most famous music player website’s in the world. in this website you can listen and download songs for free. also of you want no limitation you can buy our premium pass’s.
                </p>
            </div>
            <div className={'flex'}>
                <div className={'flex flex-col'}>
                    <p>Melodies </p>
                </div>
                <div className={'flex flex-col'}>
                    <p>Access </p>
                </div>
                <div className={'flex flex-col'}>
                    <p>Contact</p>
                </div>


            </div>
            <div className={'flex flex-col'}>
                <p>Melodies </p>
                <div className={'flex '}>
                    <img src={''} alt={'facebook'} />
                    <img src={''} alt={'facebook'} />
                    <img src={''} alt={'facebook'} />
                    <img src={''} alt={'facebook'} />
                </div>
            </div>
        </div>
    );
};

export default Footer;