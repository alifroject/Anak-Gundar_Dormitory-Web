import React from 'react';

const MainContent = () => {
    return (
        <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-4">Pro Sidebar</h1>
            <p className="mb-4">
                This is a responsive sidebar template with dropdown menu based on bootstrap 4 framework.
            </p>
            <p className="mb-4">
                You can find the complete code on
                <a className="text-blue-500" href="#">
                    Github
                </a>
                , it contains more themes and background image option.
            </p>
            <div className="flex items-center mb-8">
                <button className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2">
                    <i className="fas fa-star mr-2"></i>
                    Star 281
                </button>
                <button className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2">
                    <i className="fas fa-code-branch mr-2"></i>
                    Fork 174
                </button>
            </div>
            <h2 className="text-xl font-bold mb-4">More templates</h2>
            <div className="flex space-x-4">
                {[
                    {
                        title: 'Angular Pro Sidebar',
                        imgSrc: 'https://storage.googleapis.com/a1aa/image/fMCDk1WJTiRVEiA6OEgI5CirIyyp5aQSnlEueckNh0GUReRnA.jpg',
                    },
                    {
                        title: 'Angular Dashboard',
                        imgSrc: 'https://storage.googleapis.com/a1aa/image/gdGKPfRgpCXgHiejUmzftm88WzjlY3UNTetUXZivQoizE5jOB.jpg',
                    },
                ].map((template, index) => (
                    <div key={index} className="bg-white shadow rounded p-4 w-1/2">
                        <img alt={`${template.title} preview`} className="mb-4" height="200" src={template.imgSrc} width="300" />
                        <h3 className="text-lg font-bold mb-2">{template.title}</h3>
                        <div className="flex space-x-2">
                            <a className="bg-blue-500 text-white px-4 py-2 rounded" href="#">
                                Github
                            </a>
                            <a className="bg-green-500 text-white px-4 py-2 rounded" href="#">
                                Preview
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainContent;
