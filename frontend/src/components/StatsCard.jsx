function StatsCard({

    title,

    value,

    color

}) {

    return (

        <div
            className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[22px] border border-[rgba(255,255,255,0.18)] rounded-xl shadow-lg p-6 text-white relative z-10"
        >

            <h2 className="text-lg">

                {title}

            </h2>

            <h1 className="text-4xl font-extrabold mt-3 bg-gradient-to-r from-[#ff5a00] to-[#e63a00] bg-clip-text text-transparent">

                {value}

            </h1>

        </div>

    );

}

export default StatsCard;