function Hero(){
    return(
        <section className="min-h-screen flex items-center justify-center px-6 bg-white">
        <div className="text-center max-w-3xl">
          {/* Glowing Main Title */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-green-600 glowing-text mb-4 leading-tight">
            Fueling the Future of Youth Football
          </h1>
  
          <p className="text-gray-700 text-lg md:text-xl mb-8">
            Discover academies, join tournaments, and take your game to the next level with <span className="font-semibold text-black">BallersAdda</span>.
          </p>
  
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 text-white bg-green-600 font-semibold rounded-full shadow-md hover:shadow-green-500/60 transition hover:scale-105 glow-button hover:cursor-pointer">
              Explore Tournaments
            </button>
            <button className="px-6 py-3 text-green-600 border border-green-600 font-semibold rounded-full hover:bg-green-50 transition hover:scale-105 hover:cursor-pointer">
              Join an Academy
            </button>
          </div>
        </div>
      </section>
    )

}
export default Hero