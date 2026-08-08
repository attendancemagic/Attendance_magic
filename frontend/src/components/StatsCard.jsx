function StatsCard({

    title,

    value,

    color

}) {

    return (

        <div
            className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100 p-6"
        >

            <h2 className="text-lg text-gray-500 font-semibold">

                {title}

            </h2>

            <h1 className="text-4xl font-extrabold mt-3 text-blue-600">

                {value}

            </h1>

        </div>

    );

}

export default StatsCard;