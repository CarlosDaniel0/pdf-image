import Github from "../Icons/Github";

export default function Footer(){
  return (<a 
    target="_blank"
    rel="noreferrer"
    className="absolute flex gap-2 left-[50%] translate-x-[-50%] bottom-5 text-white" 
    href="https://github.com/carlosdaniel0/">
    <Github size={24} />
    <span>CarlosDaniel0</span>
  </a>)
}