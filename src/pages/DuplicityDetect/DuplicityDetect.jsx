import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { REACT_APP_IP } from "../../services/common";

const ImageScanner = () => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [duplicatesData, setDuplicatesData] = useState([]);
  const [showDuplicates, setShowDuplicates] = useState(true);
  const [columnName, setColumnName] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const token = JSON.parse(localStorage.getItem("userData"));
  let { fileId } = JSON.parse(localStorage.getItem("fileId")) || "";
  let imageName = JSON.parse(localStorage.getItem("imageName")) || "";
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://${REACT_APP_IP}:4000/get/headerdata/${fileId}`,
          {
            headers: {
              token: token,
            },
          }
        );
        setCsvHeaders(response.data.headers);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [fileId, token]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        if (editModal) {
          setEditModal(false);
        } else if (!showDuplicates) {
          setShowDuplicates(true);
        }
      } else if (event.altKey && event.key === "s") {
        // Ensure currentRowData is not null before updating
        if (currentRowData) {
          onUpdateCurrentDataHandler();
        } else {
          console.error("currentRowData is null when trying to update.");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentRowData, editModal, showDuplicates]);

  const changeCurrentCsvDataHandler = (key, newValue) => {
    setCurrentRowData((prevData) => ({
      ...prevData,
      row: {
        ...prevData.row,
        [key]: newValue,
      },
    }));
  };

  const onFindDuplicatesHandler = async (columnName) => {
    try {
      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/duplicate/data`,
        {
          colName: columnName,
          fileID: fileId,
          imageColumnName: imageName,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.data?.message) {
        toast.success(response.data?.message);
        return;
      }

      setDuplicatesData(response.data.duplicates);
      const url = response.data?.duplicates[0].base64Image;
      setImageUrl(url);
      setColumnName(columnName);
      setShowDuplicates(false);
      toast.success("Successfully fetched all duplicates data!");
    } catch (error) {
      console.log(error);
      toast.warning(error.response?.data?.message);
    }
  };

  const onRemoveDuplicateHandler = async (index, rowIndex, colName) => {
    const newData = [...duplicatesData];

    const filteredData = newData.filter(
      (item) => item.row[columnName] === colName
    );

    // Check if there is only one occurrence found
    if (filteredData.length === 1) {
      toast.warning("Removing the row is not permitted.");
      return;
    }

    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/delete/duplicate`,
        { index: parseInt(rowIndex), fileID: fileId },
        {
          headers: {
            token: token,
          },
        }
      );

      newData.splice(index, 1);
      newData.forEach((data) => {
        if (data.index > rowIndex) {
          data.index -= 1;
        }
      });

      setDuplicatesData(newData);
      toast.success("Row Deleted successfully!");
    } catch (error) {
      console.log(error);
    }
  };

  const onEditModalHandler = (data) => {
    setCurrentRowData(data);
    setEditModal(true);
    const indexToUpdate = duplicatesData.findIndex(
      (item) => item.index === data?.index
    );
    if (indexToUpdate !== -1) {
      setImageUrl(duplicatesData[indexToUpdate].base64Image);
    }
  };

  const onUpdateCurrentDataHandler = async () => {
    // console.log("update", currentRowData);
    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/update/duplicatedata`,
        {
          index: currentRowData?.index,
          fileID: fileId,
          rowData: currentRowData.row,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      const indexToUpdate = duplicatesData.findIndex(
        (item) => item.index === currentRowData?.index
      );
      if (indexToUpdate !== -1) {
        const updatedDuplicateData = duplicatesData.map((item, index) => {
          if (index === indexToUpdate) {
            return {
              ...item,
              row: currentRowData.row,
            };
          }
          return item;
        });
        setDuplicatesData(updatedDuplicateData);
      }
      toast.success("The row has been updated successfully.");
      setEditModal(false);
    } catch (error) {
      toast.error("Unable to update the row data!");
    }
  };

  const onDuplicateCheckedHandler = () => {
    navigate(`/csvuploader/templatemap/${id}`);
  };

  return (
    <div className="flex duplicateImg border-1 pt-16">
      {showDuplicates ? (
        <div className="flex justify-center w-[100%] pb-32 mb-10">
          <div className="mt-40 w-[800px]">
            {/* MAIN SECTION  */}
            <section className="mx-auto w-full max-w-7xl  px-12 py-10 bg-white rounded-xl">
              <div className="flex flex-col space-y-4  md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                  <h2 className="text-3xl font-semibold">Find Duplicates</h2>
                </div>
              </div>
              <div className="mt-6 flex flex-col w-full">
                <div className="mx-4 -my-2  sm:-mx-6 lg:-mx-8">
                  <div className="inline-block  py-2 align-middle md:px-6 lg:px-8">
                    <div className=" border border-gray-200 md:rounded-lg ">
                      <div className="divide-y divide-gray-200 ">
                        <div className="bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div className="px-8 py-3.5 text-left text-xl font-semibold text-gray-700">
                              <span>Headers</span>
                            </div>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-200 bg-white overflow-y-auto max-h-[300px] w-full">
                          {csvHeaders?.map((columnName, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <div className="whitespace-nowrap px-4 py-4">
                                <div className="flex items-center">
                                  <div className="ml-4 w-full font-semibold">
                                    <div className=" px-2">{columnName}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="whitespace-nowrap px-4 py-4 text-right">
                                <button
                                  onClick={() =>
                                    onFindDuplicatesHandler(columnName)
                                  }
                                  className="rounded border border-indigo-500 bg-indigo-500 px-10 py-1 font-semibold text-white"
                                >
                                  Check
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={onDuplicateCheckedHandler}
                  class="group inline-block rounded bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
                >
                  <span class="block rounded-sm  px-8 py-3 text-sm font-medium group-hover:bg-transparent">
                    Complete
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <>
          {/* LEFT SECTION  */}
          <div className="flex w-[30%]">
            <div className="flex items-center  justify-center px-2 text-center sm:block sm:p-0">
              {!editModal ? (
                <div className="inline-block align-bottom h-[100vh]  bg-teal-100 rounded-lg text-left shadow-md overflow-hidden transform transition-all mt-4  sm:align-middle md:max-w-xl sm:w-full">
                  <div className=" py-4 px-4">
                    <div className="sm:flex ">
                      <div className="text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <div className="flex justify-between">
                          <h1 className="text-xl font-bold text-gray-500 mb-6">
                          Duplicates : {duplicatesData.length}
                          </h1>
                          <h1 className="text-xl font-bold text-gray-500 mb-6">
                            Column Name : {columnName}
                          </h1>
                        </div>
                        <div className="text-gray-600 font-semibold my-2">
                          <dl className="-my-3 divide-y divide-gray-100 text-sm">
                            <div className="grid grid-cols-3 gap-1 py-3 text-center even:bg-gray-50 sm:grid-cols-7 sm:gap-4">
                              <dt className="font-medium text-md text-gray-700">
                                {columnName}
                              </dt>
                              <dd className="text-gray-700 font-medium sm:col-span-2">
                                Row Index
                              </dd>
                              <dd className="text-gray-700 font-medium sm:col-span-2">
                                Edit
                              </dd>
                              <dt className="font-medium text-md text-gray-700">
                                Remove
                              </dt>
                            </div>
                          </dl>
                        </div>
                        <div className="text-gray-600 font-semibold my-2 overflow-y-auto h-[80vh] mt-7">
                          <dl className="-my-3 divide-y divide-gray-100 text-sm">
                            {duplicatesData?.map((data, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-3 gap-1 py-3 text-center even:bg-gray-50 sm:grid-cols-7 sm:gap-4"
                              >
                                <dt className="font-medium text-md text-gray-700">
                                  {data.row[columnName]}
                                </dt>
                                <dd className="text-gray-700 font-medium sm:col-span-2">
                                  {data.index}
                                </dd>
                                <div className="text-gray-700 font-medium sm:col-span-2">
                                  <div className="relative">
                                    <div className="inline-flex items-center overflow-hidden rounded-md border bg-white">
                                      <button
                                        onClick={() => onEditModalHandler(data)}
                                        className="border-e px-4 py-2 text-sm/none text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <dd
                                  onClick={() =>
                                    onRemoveDuplicateHandler(
                                      index,
                                      data.index,
                                      data.row[columnName]
                                    )
                                  }
                                  className="text-red-700 text-2xl ml-8"
                                >
                                  <MdDelete />
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="inline-block align-bottom  bg-teal-100 rounded-lg text-left shadow-md transform transition-all  sm:align-middle md:max-w-xl sm:w-full">
                  <div className=" py-4 px-4">
                    <div className="sm:flex ">
                      <div className="text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <div className="text-gray-600 font-semibold my-2 overflow-y-auto h-[80vh] mt-7">
                          <div className="divide-y divide-gray-100 text-sm">
                            <div>
                              {currentRowData &&
                                currentRowData.row &&
                                Object.entries(currentRowData.row).map(
                                  ([key, value], index) => (
                                    <tr key={index}>
                                      {key !== imageName && (
                                        <div className="py-2 px-2 text-center">
                                          {key.toUpperCase()}
                                        </div>
                                      )}
                                      {key !== imageName && (
                                        <td className="py-2 p-2 px-2 text-center">
                                          <input
                                            className="text-center p-2"
                                            type="text"
                                            value={value} // Display the current value in the input box
                                            placeholder={value} // Optional: You can keep the placeholder if needed
                                            onChange={(e) =>
                                              changeCurrentCsvDataHandler(
                                                key,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </td>
                                      )}
                                    </tr>
                                  )
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between px-7 py-2">
                    <button
                      onClick={() => setEditModal(false)}
                      class="group inline-block rounded bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
                    >
                      <span class="block rounded-sm  px-8 py-2 text-md font-medium group-hover:bg-transparent">
                        Back
                      </span>
                    </button>
                    <button
                      onClick={onUpdateCurrentDataHandler}
                      class="group inline-block rounded bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
                    >
                      <span class="block rounded-sm  px-8 py-2 text-md font-medium group-hover:bg-transparent">
                        Save
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION  */}
          {!imageUrl ? (
            <div className="flex w-[65%] justify-center items-center ">
              <div className="">
                <ImageNotFound />

                <h1 className="mt-8 text-2xl font-bold tracking-tight text-gray-700 sm:text-4xl">
                  Please Select Image...
                </h1>

                <p className="mt-4 text-gray-600 text-center">
                  We can't find that page!!
                </p>
              </div>
            </div>
          ) : (
            <div className=" pb-2 w-[80%] py-3">
              <div className="mx-auto max-w-screen-xl px-2 lg:pt-2 sm:px-6 lg:px-8">
                <div className="mt-2 flex justify-center pt-6 py-4">
                  <div className="">
                    {imageUrl && (
                      <div
                        style={{
                          position: "relative",
                          border: "1px solid purple",
                        }}
                        className="w-full overflow-y-auto"
                      >
                        <img
                          src={`data:image/jpeg;base64,${imageUrl}`}
                          alt="Selected"
                          style={{
                            width: "48rem",
                            height: "50rem",
                          }}
                          draggable={false}
                          data-bs-toggle="modal"
                          data-bs-target="#exampleModal"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageScanner;
