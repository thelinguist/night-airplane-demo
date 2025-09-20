import { useState } from "react"
import githubIcon from "./assets/github.svg"

const Footer = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <footer>
      <a
        href="https://github.com/thelinguist/night-airplane-demo"
        target="_blank"
        rel="noopener noreferrer"
        className="socials"
      >
        <img
          src={githubIcon}
          alt="GitHub Repo"
          style={{
            filter: "invert(1)",
            width: "100%",
            height: "100%",
          }}
        />
      </a>
      <button
        onClick={() => setIsDialogOpen(!isDialogOpen)}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          padding: 0,
          font: "inherit",
          textDecoration: "underline",
        }}
      >
        Credits
      </button>
      <dialog
        open={isDialogOpen}
        onClick={() => setIsDialogOpen(false)}
        style={{
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
        }}
      >
        <p>
          Code by{" "}
          <a
            href="https://bryceshelley.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bryce Shelley
          </a>
        </p>
        <p>
          3D Model by{" "}
          <a
            href="https://sketchfab.com/hardiegnome"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hardy Noer on Sketchfab
          </a>
        </p>
      </dialog>
    </footer>
  )
}

export default Footer
