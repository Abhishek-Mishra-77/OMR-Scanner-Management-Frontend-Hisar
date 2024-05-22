import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { onGetTemplateHandler, REACT_APP_IP } from "../../services/common";

const TemplateMapping = () => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [templateHeaders, setTemplateHeaders] = useState();
  const [selectedAssociations, setSelectedAssociations] = useState({});
  const [showModal, setShowModal] = useState(false);

  const { id } = useParams();

  const navigate = useNavigate();
  let { fileId } = JSON.parse(localStorage.getItem("fileId")) || "";
  let token = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();
        const templateData = response?.find((data) => data.id == id);
        templateData.templetedata.push({ attribute: "Image" });
        setTemplateHeaders(templateData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, [id]);

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
        localStorage.setItem(
          "totalData",
          JSON.stringify(response.data.rowCount)
        );
        setCsvHeaders(response.data.headers);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [fileId, token]);

  const handleCsvHeaderChange = (csvHeader, index) => {
    const updatedAssociations = { ...selectedAssociations };
    updatedAssociations[csvHeader] = index;
    setSelectedAssociations(updatedAssociations);

    csvHeaders.forEach((header) => {
      if (!(header in updatedAssociations)) {
        updatedAssociations[header] = "";
      }
    });

    setSelectedAssociations(updatedAssociations);
  };

  const handleTemplateHeaderChange = (csvHeader, templateHeader) => {
    const updatedAssociations = { ...selectedAssociations };

    if (templateHeader.includes("--")) {
      const [min, max] = templateHeader.split("--");
      const newMin = parseInt(min);
      const newMax = parseInt(max);

      console.log(min, max);

      // Loop through all headers
      Object.keys(selectedAssociations).forEach((header) => {
        const questionNumber = parseInt(header.replace(/\D/g, ""));
        if (questionNumber >= newMin && questionNumber <= newMax) {
          updatedAssociations[header] = templateHeader;
        }
      });
    } else if (templateHeader === "UserFieldName") {
      updatedAssociations[csvHeader] = "";
    } else {
      updatedAssociations[csvHeader] = templateHeader;
    }

    // Ensure all headers are included in updatedAssociations
    csvHeaders.forEach((header) => {
      if (!(header in updatedAssociations)) {
        updatedAssociations[header] = "";
      }
    });

    setSelectedAssociations(updatedAssociations);
  };

  const onMapSubmitHandler = async () => {
    const mappedvalues = Object.values(selectedAssociations);
    // if (Object.keys(selectedAssociations).length !== csvHeaders.length) {
    //   toast.error("please map all fields. ");
    //   return;
    // }
    // console.log(selectedAssociations);

    console.log(mappedvalues);

    if (!mappedvalues.includes("Image")) {
      toast.error("Please select all the field properly.");
      return;
    }
    const mappedData = {
      ...selectedAssociations,
      fileId: fileId,
    };

    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/data`,
        { mappedData },
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("Mapping successfully done.");
      navigate(`/csvuploader/taskAssign/${id}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="py-12 min-h-[100vh] overflow-y overflow-x-auto flex justify-center templatemapping">
      <div className="w-[700px] mt-20">
        <h1 className="text-white text-4xl text-center mb-10">Mapping</h1>
        {csvHeaders &&
          csvHeaders.map((csvHeader, index) => (
            <div key={index} className="flex w-full justify-center">
              <select
                className="block w-1/3 py-1  me-10 mb-3 text-xl font-semibold text-center border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                aria-label="Csv Header Name"
                onChange={(e) =>
                  handleCsvHeaderChange(csvHeader, e.target.value)
                }
                value={csvHeader}
              >
                <option disabled defaultValue>
                  Select CSV Header Name
                </option>
                {csvHeaders.map((csvData, idx) => (
                  <option key={idx} value={csvData}>
                    {csvData}
                  </option>
                ))}
              </select>

              {/* User Typed field */}

              <select
                className="block w-1/3 py-1  ms-10 mb-3 text-xl font-semibold text-center border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                aria-label="Large select example"
                onChange={(e) =>
                  handleTemplateHeaderChange(csvHeader, e.target.value)
                }
                value={selectedAssociations[csvHeader] || "UserFieldName"}
              >
                <option>UserFieldName</option>
                {templateHeaders &&
                  templateHeaders?.templetedata?.map((template, idx) => (
                    <option key={idx} value={template.attribute}>
                      {template.attribute}
                    </option>
                  ))}
              </select>
            </div>
          ))}

        <div className="text-center mt-5 pt-5">
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
                        <div className="text-gray-600 font-semibold my-2 overflow-y-auto h-[300px]">
                          <dl className="-my-3 divide-y divide-gray-100 text-sm">
                            {Object.entries(selectedAssociations).map(
                              ([csvHeader, templateHeader], index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-1 gap-1 py-3 text-center even:bg-gray-50 sm:grid-cols-3 sm:gap-4"
                                >
                                  <dt className="font-medium text-md text-gray-700 text-center">
                                    {csvHeader}
                                  </dt>
                                  <dd className="text-gray-700 font-medium sm:col-span-2 text-center">
                                    {templateHeader}
                                  </dd>
                                </div>
                              )
                            )}
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={() => {
                        onMapSubmitHandler();
                        setShowModal(false);
                      }}
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
      </div>
    </div>
  );
};
export default TemplateMapping;
