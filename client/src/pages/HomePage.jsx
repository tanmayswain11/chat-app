
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import SideBar from "../components/SideBar";

const HomePage = () => {

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]">
        <SideBar />
        <ChatContainer />
        <RightSidebar />
      </div>
    </div>
  );
};
export default HomePage;
