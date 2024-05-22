import React, { useContext, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/images/image.png";
import dataContext from "../../Store/DataContext";
import { REACT_APP_IP } from "../../services/common";

export default function Login() {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const dataCtx = useContext(dataContext);

  const handleInput = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/users/login`,
        values
      );

      if (response.status === 200) {
        localStorage.setItem("userData", JSON.stringify(response.data.token));
        dataCtx.modifyIslogin(true);
        dataCtx.modifyLoginData(response.data);
        console.log(response.data, "logonadta");
        toast.success("Login Successfull", {
          position: "bottom-left",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      } else {
        console.error("Login failed:", response.data.error);
        toast.error("Login failed: Try Again!!", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error("Login request failed:", error.message);
      toast.error(error.response.data.error, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  };

  return (
    <section className="flex justify-center pt-2">
      <div className=" px-4 py-12 sm:px-6 sm:py-16 lg:px-24 lg:pt-8 my-48 bg-white rounded-2xl border-none shadow-lg shadow-slate-300">
        <div className="xl:mx-auto xl:w-full xl:max-w-sm 2xl:max-w-md">
          <div className="mb-7 flex justify-center">
            <img className="h-15 w-auto" src={logo} alt="Your Company" />
          </div>
          <h2 className="text-center text-3xl font-bold leading-tight text-black">
            Sign in to your account
          </h2>

          <form
            action="#"
            method="POST"
            className="mt-5"
            onSubmit={handleSubmit}
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="text-base font-medium text-gray-900"
                >
                  {" "}
                  Email address{" "}
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    className="flex h-10 w-full shadow-blue-200 shadow-md rounded-md border border-gray-300 bg-transparent px-3 py-2 text-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    type="email"
                    name="email"
                    required
                    placeholder="Email"
                    onChange={handleInput}
                  ></input>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-base font-medium text-gray-900"
                  >
                    {" "}
                    Password{" "}
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    className="flex h-10 w-full shadow-blue-200 shadow-md  rounded-md border border-gray-300 bg-transparent px-3 py-2 text-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    type="password"
                    required
                    name="password"
                    placeholder="Password"
                    onChange={handleInput}
                  ></input>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center mt-3 justify-center  hover:shadow-gray-200 hover:shadow-xl  rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                >
                  Sign In <FaArrowRight className="ml-4 " size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
