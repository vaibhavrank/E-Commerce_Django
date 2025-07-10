import img1 from '../../../assets/images/textmoving_bg.jpg'
const ClosetSection = () => {
  return (
    <div className="relative w-full h-[28rem] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute h-full inset-0 bg-cover z-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${img1})`
        }}
      >
        {/* Dark overlay for better text visibility */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30 z-0" />
      </div>
      
      {/* Scrolling Text Container */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="relative w-full">
          {/* Moving Text */}
          <div className="animate-scroll whitespace-nowrap">
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              let's share our closets
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              •
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              let's share our closets
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              •
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              let's share our closets
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              •
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              let's share our closets
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              •
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              let's share our closets
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              •
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              let's share our closets
            </span>
            <span className="text-white text-4xl md:text-6xl font-bold mx-8">
              •
            </span>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for the scrolling animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 15s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default ClosetSection;