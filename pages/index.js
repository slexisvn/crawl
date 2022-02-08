import Head from "next/head";
import { useRef } from "react";
import styles from "../styles/Home.module.css";

function convertToCSV(arr) {
  const array = [Object.keys(arr[0])].concat(arr);

  return array
    .map((it) => {
      return Object.values(it).toString();
    })
    .join("\n");
}

function exportToCsv(filename, rows) {
  const blob = new Blob([convertToCSV(rows)], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default function Home() {
  const inputDomRef = useRef(null);

  const handleSubmitBtnClick = () => {
    fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ githubLink: inputDomRef.current.value }),
    });
  };

  const handleExportBtnClick = () => {
    fetch("/api")
      .then((_) => _.json())
      .then(({ data }) => {
        if (data.length > 0) {
          exportToCsv("GitHub", data);
        }
      });
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.box}>
            <div className={styles.title}>Github Crawler</div>
            <div className={styles["input-wrapper"]}>
              <input
                ref={inputDomRef}
                className={styles.input}
                placeholder="Enter Gihub link. Eg: https://github.com/facebook/react/"
              />
              <button className={styles.button} onClick={handleSubmitBtnClick}>
                Submit
              </button>
            </div>

            <button className={styles.button} onClick={handleExportBtnClick}>
              Export CSV
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
