import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dataContext from "../../Store/DataContext";
import {
  onGetAllUsersHandler,
  onGetVerifiedUserHandler,
} from "../../services/common";
import { REACT_APP_IP } from "../../services/common";
import axios from "axios";

const TemplateMapping = () => {
  const [showModal, setShowModal] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [selectedUser, setSelectedUser] = useState({
    userId: "",
    userName: "",
  });
  const [taskValue, setTaskValue] = useState({ min: 1, max: null });
  const dataCtx = useContext(dataContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const { fileId } = JSON.parse(localStorage.getItem("fileId")) || "";
  const token = JSON.parse(localStorage.getItem("userData"));
  const totalData = JSON.parse(localStorage.getItem("totalData")) || "";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await onGetAllUsersHandler();
        setAllUsers(response.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await onGetVerifiedUserHandler();
        setCurrentUser(response.user);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [selectedUser]);

  const onTaskAssignedHandler = () => {
    if (Number(taskValue.max) > totalData) {
      toast.warning("Max value must be less than or equal to the total data.");
      return;
    }

    if (
      !taskValue.max ||
      taskValue.max <= 0 ||
      taskValue.max <= taskValue.min
    ) {
      toast.warning("Please check your input values.");
      return;
    }

    if (!fileId) {
      toast.warning("File Id not present!");
      return;
    }
    if (!selectedUser.userName || !selectedUser.userId) {
      toast.warning("Please select the file id or username!");
      return;
    }

    const newAssignedTask = {
      fileId: fileId,
      templeteId: id,
      userId: selectedUser.userId,
      min: taskValue.min,
      max: taskValue.max,
      userName: selectedUser.userName,
    };
    setAssignedUsers([...assignedUsers, newAssignedTask]);

    let newMinValue = parseInt(taskValue.max) + 1;
    if (isNaN(newMinValue)) {
      newMinValue = taskValue.min;
    }
    setTaskValue({ ...taskValue, min: newMinValue, max: "" });
    toast.success("Task successfully assigned. Thank you.");
  };

  const onTaskSubmitHandler = async () => {
    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/assign/user`,
        assignedUsers,
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("Task assignment successful.");
      dataCtx.modifyIsLoading(false);
      navigate(`/csvuploader`);
    } catch (error) {
      console.error("Error uploading files: ", error);
      toast.error("Error submitting task. Please try again.");
    }
  };

  return (
    <div className=" min-h-[100vh] flex justify-center templatemapping">
      <div className=" mt-40 w-full">
        {/* MAIN SECTION  */}
        <section className="mx-auto w-full max-w-7xl  px-12 py-10 bg-white rounded-xl">
          <div className="flex flex-col space-y-4  md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h2 className="text-3xl font-semibold">Assign Tasks</h2>
            </div>
            <article className="rounded-xl bg-white p-4 ring ring-indigo-50 sm:p-6 lg:p-8">
              <div className="flex items-start sm:gap-8">
                <div className="flex gap-3">
                  <h1 className="rounded border border-indigo-500 bg-indigo-500 px-3 py-2 font-medium text-white">
                    Total Data - {totalData}
                  </h1>
                </div>
              </div>
            </article>
          </div>
          <div className="mt-6 flex flex-col">
            <div className="-mx-4 -my-2  sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className=" border border-gray-200 md:rounded-lg ">
                  <table className="min-w-full divide-y divide-gray-200 ">
                    <thead className="bg-gray-50 ">
                      <tr>
                        <th
                          scope="col"
                          className="px-8 py-3.5 text-left text-xl font-semibold text-gray-700"
                        >
                          <span>Users</span>
                        </th>

                        <th
                          scope="col"
                          className="px-12 py-3.5 text-left  text-xl font-semibold text-gray-700"
                        >
                          Min
                        </th>

                        <th
                          scope="col"
                          className="px-12 py-3.5 text-left text-xl font-semibold text-gray-700"
                        >
                          Max
                        </th>

                        <th scope="col" className="relative px-4 py-3.5">
                          <span className="sr-only">Edit</span>
                        </th>
                        <th scope="col" className="relative px-4 py-3.5">
                          <span className="sr-only">Delete</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white ">
                      <tr>
                        <td className="whitespace-nowrap px-4 py-4 border-2">
                          <div className="flex items-center">
                            <div className="ml-4 w-full">
                              <div className="overflow-y-auto h-[310px] px-2 ">
                                {allUsers?.map((user, i) => {
                                  if (currentUser.id !== user.id) {
                                    return (
                                      <button
                                        onClick={() =>
                                          setSelectedUser({
                                            ...selectedUser,
                                            userId: user.id,
                                            userName: user.userName,
                                          })
                                        }
                                        className={`group flex items-center justify-between w-full mt-2 rounded-lg hover:bg-gray-300 bg-gray-100 px-4 py-2 text-gray-700 
                                       ${
                                         selectedUser.userId === user.id
                                           ? "bg-gray-500 text-white"
                                           : "text-gray-500  hover:text-gray-700"
                                       }`}
                                      >
                                        <span className="text-sm font-medium">
                                          {user.userName}
                                        </span>
                                      </button>
                                    );
                                  } else {
                                    return null;
                                  }
                                })}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-12 py-4">
                          <div className="text-2xl text-gray-900 ">
                            <input
                              type="number"
                              min="1"
                              value={taskValue.min}
                              readOnly
                              id="Line3Qty"
                              className="h-10 w-16 rounded border-gray-400 bg-gray-200 p-0 text-center text-gray-600 [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-12 py-4">
                          <div className="text-2xl text-gray-900">
                            <input
                              type="number"
                              id="Line3Qty"
                              value={taskValue.max}
                              onChange={(e) =>
                                setTaskValue({
                                  ...taskValue,
                                  max: e.target.value,
                                })
                              }
                              className="h-10 w-16 rounded border-gray-400 bg-gray-200 p-0 text-center text-gray-600 [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <button
                            onClick={onTaskAssignedHandler}
                            className="rounded border border-indigo-500 bg-indigo-500 px-3 py-1 font-semibold text-white"
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* MODEL SECTION  */}
          <div className="text-right mt-10">
            <label
              onClick={() => setShowModal(true)}
              className="font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl
               shadow-md cursor-pointer select-none text-xl px-12 py-2 hover:shadow-xl active:shadow-md"
            >
              <span>Save</span>
            </label>

            {showModal && (
              <div className="fixed z-10 inset-0 overflow-y-auto ">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div
                    className="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                  >
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>

                  <span
                    className="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true"
                  >
                    &#8203;
                  </span>

                  <div className=" inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                          <h1 className="text-xl  font-bold text-gray-500 mb-6">
                            Mapped Data..
                          </h1>
                          <div className="overflow-y-auto h-[400px]">
                            {assignedUsers.map((assignUser) => (
                              <article className="flex justify-between rounded-lg border border-gray-100 bg-white p-6">
                                <p className="text-2xl font-medium text-gray-900 text-center">
                                  {assignUser.userName}
                                </p>

                                <span className="text-md font-medium text-center rounded bg-green-100 p-3 min-w-[50px] border-2 text-green-600 ">
                                  {assignUser.min}
                                </span>
                                <span className="text-md font-medium text-center rounded bg-green-100 p-3 min-w-[50px] border-2 text-green-600 ">
                                  {assignUser.max}
                                </span>
                              </article>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        onClick={onTaskSubmitHandler}
                        type="button"
                        className=" my-3 ml-3 w-full sm:w-auto inline-flex justify-center rounded-xl
               border border-transparent px-4 py-2 bg-teal-600 text-base leading-6 font-semibold text-white shadow-sm hover:bg-teal-500 focus:outline-none focus:border-teal-700 focus:shadow-outline-teal transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        type="button"
                        className=" my-3 w-full sm:w-auto inline-flex justify-center rounded-xl
               border border-transparent px-4 py-2 bg-gray-300 text-base leading-6 font-semibold text-gray-700 shadow-sm hover:bg-gray-400 focus:outline-none focus:border-gray-600 focus:shadow-outline-gray transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
export default TemplateMapping;
